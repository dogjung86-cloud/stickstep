// hookM2u2, 중2 수학 Ⅱ(부등식과 연립방정식) 훅 장면 9종. hookMath.ts의 mathHook이 디스패치한다.
// 장면 계약: (scene, helper, finish, face, choices?), 공용 hookAsk.ask()만 사용,
// choices[0]=정답, good≠bad(오개념 교정), 소재명·설정은 도입(helper/narrator)에서 소개.
// 조작 먼저 → 예측 나중. 상태 변화는 인라인 스타일 트랜지션 + setTimeout(rAF 금지).
// SVG 파운드리 문법: 3스톱 그라데이션 면 + 좌상단 키라이트 + 접촉 그림자(#2A3A5E) + 재질별 최암색 외곽선.
// 수학 UI 텍스트 em대시 금지(−와 혼동), 제목류는 콜론·본문은 쉼표.
// 장면: eggsize·colder·rollercoaster·groupticket·fourcut·boats·bingsu·combo·pheasant
import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { ask } from "./hookAsk";
import type { AvatarKind } from "../../ui/avatar";

type Face = (k: AvatarKind) => void;
type SceneFn = (scene: HTMLElement, helper: HTMLElement, finish: () => void, face: Face, choices?: string[]) => void;

const SHADOW = (cx: number, cy: number, rx: number, o = 0.11): string =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="5" fill="#2A3A5E" opacity="${o}"/>`;

const wrapSvg = (inner: string, defs = "", vb = "0 0 360 200"): string =>
  `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" fill="none"><defs>${defs}</defs>${inner}</svg>`;

const mkBtn = (label: string, pulse = true): HTMLButtonElement =>
  el("button", { class: `swapbtn${pulse ? " pulse" : ""}`, attrs: { type: "button" } }, el("span", { text: label }));

const q = <T extends Element>(root: HTMLElement, sel: string): T => root.querySelector(sel) as T;

/* 배경 카드 그라데이션(장면 공용) — 캐러멜 크림 톤(단원 액센트 #A9631B 계열) */
const BG = `<linearGradient id="h2-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBF5EE"/><stop offset=".55" stop-color="#F6EBDC"/><stop offset="1" stop-color="#F1E2D0"/></linearGradient>`;
const CARD = `<rect x="10" y="8" width="340" height="184" rx="16" fill="url(#h2-bg)"/>`;
const SPRING = "var(--spring, cubic-bezier(.34,1.35,.5,1))";

/* 1 eggsize: 계란 등급표 — 특란의 조건은 '범위'. 저울 바늘이 특란·왕란 경계 68에 딱 멈춘다 */
export const renderEggsize: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  // 계란(b=바닥 y, s=스케일): 위가 갸름하고 아래가 둥근 표준 곡선
  const egg = (cx: number, b: number, s = 1): string =>
    `<path d="M${cx} ${b - 30 * s} C${cx + 9 * s} ${b - 30 * s} ${cx + 14 * s} ${b - 19 * s} ${cx + 14 * s} ${b - 12 * s} A${14 * s} ${12 * s} 0 0 1 ${cx - 14 * s} ${b - 12 * s} C${cx - 14 * s} ${b - 19 * s} ${cx - 9 * s} ${b - 30 * s} ${cx} ${b - 30 * s} Z" fill="url(#eg-egg)" stroke="#B08A4C" stroke-width="1.4"/>
    <ellipse cx="${cx - 4.5 * s}" cy="${b - 19 * s}" rx="${3.4 * s}" ry="${5 * s}" fill="#FFFDF4" opacity=".8" transform="rotate(-16 ${cx - 4.5 * s} ${b - 19 * s})"/>`;
  const sticker = (x: number, rot: number, name: string, range: string, hot: boolean): string =>
    `<g transform="rotate(${rot} ${x + 33} 44)">
      <rect x="${x}" y="24" width="66" height="40" rx="9" fill="url(#eg-card)" stroke="${hot ? "#7F4A12" : "#C4A97E"}" stroke-width="1.4"/>
      <rect x="${x}" y="24" width="66" height="16" rx="8" fill="url(#eg-band${hot ? "h" : ""})"/>
      <rect x="${x}" y="32" width="66" height="8" fill="url(#eg-band${hot ? "h" : ""})"/>
      <text x="${x + 33}" y="36" text-anchor="middle" font-size="10" font-weight="900" fill="#FFFFFF">${name}</text>
      <text x="${x + 33}" y="56" text-anchor="middle" font-size="9" font-weight="800" fill="#6B4E2A">${range}</text>
      <ellipse cx="${x + 13}" cy="28" rx="7" ry="2" fill="#fff" opacity=".45"/>
    </g>`;
  fig.innerHTML = wrapSvg(
    `${CARD}
    ${sticker(24, -3, "왕란", "68g 이상", false)}
    ${sticker(96, 2, "특란", "60~68g", true)}
    ${sticker(168, -2, "대란", "52~60g", false)}
    ${SHADOW(98, 168, 72, 0.12)}
    ${egg(50, 134, 0.9)}${egg(82, 132, 0.9)}${egg(114, 134, 0.9)}${egg(146, 132, 0.9)}
    <rect x="26" y="124" width="144" height="42" rx="9" fill="url(#eg-crate)" stroke="#8C6A3A" stroke-width="1.5"/>
    <path d="M66 128 q4 17 0 34 M98 128 q4 17 0 34 M130 128 q4 17 0 34" stroke="#B08A52" stroke-width="1.2" fill="none" opacity=".7"/>
    <ellipse cx="46" cy="129" rx="13" ry="2.4" fill="#fff" opacity=".35"/>
    <g id="eg-scale" opacity="0" style="transition: opacity .5s, transform .5s ${SPRING}; transform: translateY(12px)">
      ${SHADOW(258, 168, 46, 0.13)}
      <rect x="214" y="86" width="88" height="78" rx="12" fill="url(#eg-body)" stroke="#7F4A12" stroke-width="1.6"/>
      <rect x="250" y="80" width="16" height="8" rx="2" fill="url(#eg-plate)" stroke="#7F4A12" stroke-width="1.2"/>
      <rect x="226" y="72" width="64" height="10" rx="5" fill="url(#eg-plate)" stroke="#7F4A12" stroke-width="1.4"/>
      <ellipse cx="242" cy="75" rx="12" ry="2" fill="#fff" opacity=".55"/>
      ${egg(258, 74, 1)}
      <circle cx="258" cy="126" r="30" fill="url(#eg-dial)" stroke="#7F4A12" stroke-width="1.5"/>
      <path d="M241 113.7 A21 21 0 0 1 264.5 106" stroke="#E4B36A" stroke-width="6" stroke-linecap="round" fill="none"/>
      <path d="M264.5 106 A21 21 0 0 1 275 113.7" stroke="#A9631B" stroke-width="6" stroke-linecap="round" fill="none"/>
      <line x1="238.6" y1="111.9" x2="235.3" y2="109.5" stroke="#8C6E4A" stroke-width="1.4"/>
      <line x1="250.6" y1="103.2" x2="249.3" y2="99.4" stroke="#8C6E4A" stroke-width="1.4"/>
      <line x1="277.4" y1="111.9" x2="280.7" y2="109.5" stroke="#8C6E4A" stroke-width="1.4"/>
      <text x="230" y="108" text-anchor="middle" font-size="7.5" font-weight="800" fill="#8C6E4A">60</text>
      <text x="286" y="108" text-anchor="middle" font-size="7.5" font-weight="800" fill="#8C6E4A">72</text>
      <text x="236" y="157" text-anchor="middle" font-size="8" font-weight="900" fill="#B98E56">특란</text>
      <text x="281" y="157" text-anchor="middle" font-size="8" font-weight="900" fill="#7F4A12">왕란</text>
      <line id="eg-needle" x1="258" y1="126" x2="258" y2="104" stroke="#B3341F" stroke-width="2.6" stroke-linecap="round" style="transform-origin: 258px 126px; transition: transform 1.35s cubic-bezier(.32,.9,.35,1.05); transform: rotate(-72deg)"/>
      <circle cx="258" cy="126" r="3.2" fill="#7F4A12"/>
      <ellipse cx="247" cy="108" rx="8" ry="3" fill="#fff" opacity=".5"/>
      <g id="eg-b68" opacity="0" style="transition: opacity .4s, transform .4s ${SPRING}; transform: scale(.5); transform-origin: 270px 90px">
        <line x1="265.4" y1="103.2" x2="267.4" y2="97.5" stroke="#7F4A12" stroke-width="2"/>
        <rect x="257" y="82" width="26" height="15" rx="7.5" fill="#FFFFFF" stroke="#A9631B" stroke-width="1.3"/>
        <text x="270" y="93" text-anchor="middle" font-size="9.5" font-weight="900" fill="#7F4A12">68</text>
      </g>
    </g>`,
    `${BG}
    <linearGradient id="eg-egg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFCF0"/><stop offset=".55" stop-color="#F8E7BE"/><stop offset="1" stop-color="#E9CD96"/></linearGradient>
    <linearGradient id="eg-crate" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EEDEC2"/><stop offset=".5" stop-color="#DFC69E"/><stop offset="1" stop-color="#C7A574"/></linearGradient>
    <linearGradient id="eg-card" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".6" stop-color="#FBF3E6"/><stop offset="1" stop-color="#F5EAD8"/></linearGradient>
    <linearGradient id="eg-band" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#D9A55E"/><stop offset="1" stop-color="#BE7F2E"/></linearGradient>
    <linearGradient id="eg-bandh" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#A9631B"/><stop offset="1" stop-color="#7F4A12"/></linearGradient>
    <linearGradient id="eg-body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FDF8EC"/><stop offset=".5" stop-color="#F2E4C9"/><stop offset="1" stop-color="#E0C89E"/></linearGradient>
    <linearGradient id="eg-plate" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7EFDD"/><stop offset=".5" stop-color="#EBD9B8"/><stop offset="1" stop-color="#D9BE8E"/></linearGradient>
    <radialGradient id="eg-dial" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".7" stop-color="#FBF4E4"/><stop offset="1" stop-color="#EEDFC2"/></radialGradient>`,
  );
  const btn = mkBtn("등급 확인하기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "마트 계란엔 <b>왕란·특란·대란</b> 같은 등급이 붙어요. 기준은 딱 하나, 한 알의 무게래요.";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    const sc = q<SVGGElement>(fig, "#eg-scale");
    sc.style.opacity = "1";
    sc.style.transform = "translateY(0)";
    window.setTimeout(() => {
      q<SVGLineElement>(fig, "#eg-needle").style.transform = "rotate(18deg)";
      haptic(HAPTIC.tap);
    }, 520);
    window.setTimeout(() => {
      const b68 = q<SVGGElement>(fig, "#eg-b68");
      b68.style.opacity = "1";
      b68.style.transform = "scale(1)";
      haptic(HAPTIC.correct);
    }, 1900);
    window.setTimeout(() => {
      face("surprised");
      helper.innerHTML = "특란은 '60g 이상 68g 미만'이에요. 무게가 딱 <b>68g</b>인 계란은 어느 등급일까요?";
      ask(box, helper, {
        choices: choices ?? ["왕란이에요, 68g은 특란에 포함되지 않아요", "특란이에요, 68g도 68g 미만이니까요", "두 등급 모두에 속해요"],
        good: "정확해요! '미만'은 그 수를 포함하지 않아요. 68g은 특란의 범위 밖, 왕란(68g 이상)의 시작점이죠. 이런 '범위의 언어'가 오늘의 주인공이에요.",
        bad: "'68g 미만'은 68g을 포함하지 않고, 등급이 겹치면 분류가 안 되겠죠. 68g은 왕란(68g 이상)이에요. 이상·미만 같은 범위의 언어를 식으로 쓰는 법을 배워요.",
        onDone: finish,
      });
    }, 2450);
  });
};

/* 2 colder: 겨울 기온 — 3<5인데 −3>−5. 예보 카드가 밤 모드로 어두워지고 수은주가 내려간다 */
export const renderColder: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  // 도시 카드: ox=왼쪽 x, id 접두, day=낮 기온 텍스트, mercTop=낮 수은주 윗변 y(0선=106, 1도=4px)
  const city = (ox: number, id: string, day: string, mercTop: number): string => {
    const tx = ox + 103;
    return `<g>
      ${SHADOW(ox + 67, 162, 58, 0.11)}
      <rect x="${ox}" y="36" width="135" height="120" rx="14" fill="url(#cd-day)" stroke="#4E6E8E" stroke-width="1.5"/>
      <rect id="${id}-n" x="${ox}" y="36" width="135" height="120" rx="14" fill="url(#cd-night)" opacity="0" style="transition: opacity .9s"/>
      <ellipse cx="${ox + 30}" cy="42" rx="16" ry="3" fill="#fff" opacity=".5"/>
      <g id="${id}-sun" style="transition: opacity .7s">
        <circle cx="${ox + 26}" cy="60" r="11" fill="url(#cd-sun)" stroke="#B8860B" stroke-width="1.2"/>
        <g stroke="#E8A93E" stroke-width="1.8" stroke-linecap="round">
          <path d="M${ox + 26} 43 v-4 M${ox + 26} 77 v4 M${ox + 9} 60 h-4 M${ox + 43} 60 h4 M${ox + 14} 48 l-3 -3 M${ox + 38} 48 l3 -3 M${ox + 14} 72 l-3 3 M${ox + 38} 72 l3 3"/>
        </g>
      </g>
      <g id="${id}-moon" opacity="0" style="transition: opacity .7s">
        <path d="M${ox + 30} 49 a11 11 0 1 0 9 17 a8.5 8.5 0 0 1 -9 -17 z" fill="url(#cd-moon)" stroke="#8A8FB8" stroke-width="1.2"/>
        <circle cx="${ox + 48}" cy="50" r="1.4" fill="#EAF0FF"/>
        <circle cx="${ox + 56}" cy="62" r="1.1" fill="#EAF0FF"/>
        <circle cx="${ox + 12}" cy="46" r="1.1" fill="#EAF0FF"/>
      </g>
      <text id="${id}-t" x="${ox + 44}" y="122" text-anchor="middle" font-size="30" font-weight="900" fill="#2A3648" style="transition: fill .7s">${day}</text>
      <rect x="${tx - 6}" y="54" width="12" height="86" rx="6" fill="url(#cd-tube)" stroke="#5E7288" stroke-width="1.3"/>
      <rect id="${id}-m" x="${tx - 3}" y="${mercTop}" width="6" height="${138 - mercTop}" rx="3" fill="url(#cd-merc)" style="transform-origin: ${tx}px 138px; transition: transform 1.15s cubic-bezier(.4,0,.3,1)"/>
      <circle cx="${tx}" cy="144" r="9.5" fill="url(#cd-merc)" stroke="#8E2430" stroke-width="1.4"/>
      <line x1="${tx - 9}" y1="106" x2="${tx + 9}" y2="106" stroke="#4E6E8E" stroke-width="1.4"/>
      <text id="${id}-z" x="${tx + 13}" y="109" font-size="8.5" font-weight="800" fill="#4E6E8E" style="transition: fill .7s">0</text>
      <ellipse cx="${tx - 2.5}" cy="64" rx="2" ry="7" fill="#fff" opacity=".55"/>
    </g>`;
  };
  fig.innerHTML = wrapSvg(
    `${CARD}
    ${city(30, "cd-a", "3°", 94)}
    ${city(195, "cd-b", "5°", 86)}
    <rect id="cd-pill" x="152" y="12" width="56" height="20" rx="10" fill="url(#cd-pillbg)" stroke="#3E5A78" stroke-width="1.2" style="transition: fill .8s"/>
    <text id="cd-when" x="180" y="26" text-anchor="middle" font-size="11" font-weight="900" fill="#FFFFFF">낮</text>`,
    `${BG}
    <linearGradient id="cd-day" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EAF6FF"/><stop offset=".55" stop-color="#D5E9FA"/><stop offset="1" stop-color="#BDD9F2"/></linearGradient>
    <linearGradient id="cd-night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A4568"/><stop offset=".55" stop-color="#242E4A"/><stop offset="1" stop-color="#1A2338"/></linearGradient>
    <radialGradient id="cd-sun" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#FFF3CC"/><stop offset=".55" stop-color="#FFDE8A"/><stop offset="1" stop-color="#EDAF45"/></radialGradient>
    <linearGradient id="cd-moon" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F4F7FF"/><stop offset=".55" stop-color="#E2E8FA"/><stop offset="1" stop-color="#C9D2F0"/></linearGradient>
    <linearGradient id="cd-tube" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#F7FBFF"/><stop offset=".5" stop-color="#E9F1F9"/><stop offset="1" stop-color="#D5E2EE"/></linearGradient>
    <linearGradient id="cd-merc" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#F58B99"/><stop offset=".5" stop-color="#E85A6B"/><stop offset="1" stop-color="#C93A4E"/></linearGradient>
    <linearGradient id="cd-pillbg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7E96B5"/><stop offset=".5" stop-color="#5E7EA0"/><stop offset="1" stop-color="#4E6E8E"/></linearGradient>`,
  );
  const btn = mkBtn("예보 비교하기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "일기예보에 두 도시의 기온이 떴어요. 낮 기온은 <b>3도와 5도</b>, 밤 기온은 <b>영하 3도와 영하 5도</b>래요.";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    (["cd-a", "cd-b"] as const).forEach((k) => {
      q<SVGRectElement>(fig, `#${k}-n`).style.opacity = ".96";
      q<SVGGElement>(fig, `#${k}-sun`).style.opacity = "0";
      q<SVGGElement>(fig, `#${k}-moon`).style.opacity = "1";
    });
    q<SVGRectElement>(fig, "#cd-pill").style.fill = "#39406A";
    q<SVGTextElement>(fig, "#cd-when").textContent = "밤";
    window.setTimeout(() => {
      const ta = q<SVGTextElement>(fig, "#cd-a-t");
      const tb = q<SVGTextElement>(fig, "#cd-b-t");
      ta.textContent = "−3°";
      tb.textContent = "−5°";
      ta.style.fill = "#F2F6FF";
      tb.style.fill = "#F2F6FF";
      q<SVGTextElement>(fig, "#cd-a-z").style.fill = "#AFC0DC";
      q<SVGTextElement>(fig, "#cd-b-z").style.fill = "#AFC0DC";
      haptic(HAPTIC.tap);
    }, 620);
    window.setTimeout(() => {
      q<SVGRectElement>(fig, "#cd-a-m").style.transform = "scaleY(.45)";
      q<SVGRectElement>(fig, "#cd-b-m").style.transform = "scaleY(.23)";
    }, 900);
    window.setTimeout(() => {
      face("surprised");
      helper.innerHTML = "낮에는 5도 도시가 더 따뜻했죠(3<5). 그럼 밤의 <b>영하 3도와 영하 5도</b> 중 더 추운 쪽은?";
      ask(box, helper, {
        choices: choices ?? [
          "영하 5도가 더 추워요, 음수가 되면 순서가 뒤집혀요",
          "영하 3도가 더 추워요, 3<5는 그대로니까요",
          "둘 다 영하라 똑같이 추워요",
        ],
        good: "맞아요! 3<5였는데 −3>−5, 부호가 음수로 바뀌면 대소가 뒤집혀요. 이 '뒤집힘'이 오늘 배울 부등식 성질의 핵심이에요.",
        bad: "수직선을 떠올려요. −5는 −3보다 원점에서 더 왼쪽, 더 추운 쪽이에요. 3<5가 음수 세계에서 −3>−5로 뒤집힌 것! 이 반전의 정체를 수직선 실험으로 확인해요.",
        onDone: finish,
      });
    }, 2200);
  });
};

/* 3 rollercoaster: 놀이기구 키 제한 — 키 재기 → 해마다 4cm 유령 실루엣 점선 3단(2년 뒤 130 도달) */
export const renderRollercoaster: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  // 키 눈금: 1cm=2.25px, 130cm=y56(가로 바), 122cm=y74(동생 머리 꼭대기), +4cm=9px
  const ghost = (id: string, ly: number, label: string, hot: boolean): string => {
    const c = hot ? "#0B7A4A" : "#A9631B";
    return `<g id="${id}" opacity="0" style="transition: opacity .45s, transform .45s ${SPRING}; transform: translateY(7px)">
      <line x1="200" y1="${ly}" x2="252" y2="${ly}" stroke="${c}" stroke-width="${hot ? 2 : 1.6}" stroke-dasharray="5 4"/>
      <circle cx="225" cy="${ly + 9}" r="8" fill="none" stroke="${c}" stroke-width="1.6" stroke-dasharray="4 3" opacity=".85"/>
      <text x="202" y="${ly - 3}" font-size="7.5" font-weight="${hot ? 900 : 800}" fill="${c}">${label}</text>
    </g>`;
  };
  fig.innerHTML = wrapSvg(
    `${CARD}
    <path d="M24 170 h312" stroke="#B08A52" stroke-width="2.5" stroke-linecap="round" opacity=".55"/>
    <path d="M212 30 q20 -14 40 0 t40 0 t40 0" stroke="#C9A76F" stroke-width="2" fill="none" opacity=".5"/>
    <rect x="236" y="24" width="12" height="7" rx="2.5" fill="#C9A76F" opacity=".6"/>
    <rect x="286" y="24" width="12" height="7" rx="2.5" fill="#C9A76F" opacity=".6"/>
    ${SHADOW(209, 172, 16, 0.1)}${SHADOW(331, 172, 16, 0.1)}
    <path d="M204 62 Q270 18 337 62 L337 74 Q270 30 204 74 Z" fill="url(#ro-arch)" stroke="#7F4A12" stroke-width="1.5"/>
    <rect x="204" y="58" width="11" height="112" rx="4" fill="url(#ro-post)" stroke="#7F4A12" stroke-width="1.4"/>
    <rect x="326" y="58" width="11" height="112" rx="4" fill="url(#ro-post)" stroke="#7F4A12" stroke-width="1.4"/>
    <path d="M209 58 v-12 l14 4 -14 4 z" fill="#B3341F" stroke="#7A1F12" stroke-width="1.2"/>
    <path d="M331 58 v-12 l14 4 -14 4 z" fill="#B3341F" stroke="#7A1F12" stroke-width="1.2"/>
    <ellipse cx="240" cy="42" rx="18" ry="4" fill="#fff" opacity=".3"/>
    ${SHADOW(258, 172, 20, 0.11)}
    <rect x="255" y="48" width="7" height="122" rx="3" fill="url(#ro-pole)" stroke="#8C6E4A" stroke-width="1.4"/>
    <path d="M255 65 h4 M255 83 h4 M255 101 h4 M255 119 h4 M255 137 h4 M255 155 h4" stroke="#8C6E4A" stroke-width="1.1"/>
    <rect x="196" y="53" width="62" height="6" rx="3" fill="url(#ro-arm)" stroke="#7F4A12" stroke-width="1.3"/>
    <g id="ro-sign" style="transition: transform .3s ${SPRING}; transform-origin: 258px 40px">
      <rect x="240" y="32" width="36" height="16" rx="8" fill="url(#ro-arm)" stroke="#7F4A12" stroke-width="1.3"/>
      <text x="258" y="43.5" text-anchor="middle" font-size="10" font-weight="900" fill="#FFFFFF">130</text>
      <ellipse cx="250" cy="35.5" rx="6" ry="1.6" fill="#fff" opacity=".5"/>
    </g>
    ${SHADOW(225, 172, 30, 0.11)}
    <circle cx="225" cy="83" r="9" fill="#FFFFFF" stroke="#2A3648" stroke-width="2"/>
    <circle cx="222" cy="82" r="1.2" fill="#2A3648"/><circle cx="228" cy="82" r="1.2" fill="#2A3648"/>
    <path d="M223 87 q2 1.6 4 0" stroke="#2A3648" stroke-width="1.3" fill="none" stroke-linecap="round"/>
    <path d="M225 92 v38 M225 102 l-11 12 M225 102 l11 10 M225 130 l-8 40 M225 130 l8 40" stroke="#2A3648" stroke-width="2" stroke-linecap="round" fill="none"/>
    <g id="ro-now" opacity="0" style="transition: opacity .45s">
      <line x1="200" y1="74" x2="252" y2="74" stroke="#4E6E8E" stroke-width="1.5" stroke-dasharray="5 4"/>
      <rect x="166" y="67" width="32" height="14" rx="7" fill="#FFFFFF" stroke="#8A9BB0" stroke-width="1.2"/>
      <text x="182" y="77.5" text-anchor="middle" font-size="9" font-weight="900" fill="#4E6E8E">122</text>
    </g>
    ${ghost("ro-g1", 65, "1년 뒤", false)}
    ${ghost("ro-g2", 56, "2년 뒤", true)}
    ${ghost("ro-g3", 47, "3년 뒤", false)}`,
    `${BG}
    <linearGradient id="ro-arch" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E4B36A"/><stop offset=".5" stop-color="#C98A3F"/><stop offset="1" stop-color="#A9631B"/></linearGradient>
    <linearGradient id="ro-post" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#D9A55E"/><stop offset=".5" stop-color="#BE7F2E"/><stop offset="1" stop-color="#96601F"/></linearGradient>
    <linearGradient id="ro-pole" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FAF3E3"/><stop offset=".5" stop-color="#EFE0C2"/><stop offset="1" stop-color="#DCC49A"/></linearGradient>
    <linearGradient id="ro-arm" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#C98A3F"/><stop offset=".5" stop-color="#A9631B"/><stop offset="1" stop-color="#7F4A12"/></linearGradient>`,
  );
  const btn = mkBtn("키 재 보기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "놀이공원 인기 기구 앞, <b>'키 130cm 이상 탑승 가능'</b> 팻말이 서 있어요. 동생 키는 지금 122cm예요.";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    q<SVGGElement>(fig, "#ro-now").style.opacity = "1";
    ["ro-g1", "ro-g2", "ro-g3"].forEach((id, k) =>
      window.setTimeout(() => {
        const g = q<SVGGElement>(fig, `#${id}`);
        g.style.opacity = "1";
        g.style.transform = "translateY(0)";
        haptic(HAPTIC.tap);
      }, 600 + k * 450),
    );
    window.setTimeout(() => {
      q<SVGGElement>(fig, "#ro-sign").style.transform = "scale(1.15)";
    }, 1700);
    window.setTimeout(() => {
      q<SVGGElement>(fig, "#ro-sign").style.transform = "scale(1)";
    }, 2000);
    window.setTimeout(() => {
      face("surprised");
      helper.innerHTML = "동생이 1년에 4cm씩 큰다면, <b>몇 년 뒤부터</b> 탈 수 있을까요? 이걸 알려면 무엇을 풀어야 할까요?";
      ask(box, helper, {
        choices: choices ?? [
          "122+4x가 130 이상이 되는 x를 구해요",
          "122+4x가 130과 같아지는 x만 구하면 돼요",
          "직접 매년 재 보기 전엔 알 수 없어요",
        ],
        good: "그렇죠! 122+4x≥130이라는 부등식을 풀면 x≥2, 2년 뒤부터예요. 방정식이 아니라 부등식을 '푸는' 기술, 오늘 배워요.",
        bad: "같아지는 순간(=)만 구하면 '딱 130cm'인 해 하나뿐이에요. 130 이상인 모든 순간을 잡으려면 부등식 122+4x≥130을 풀어야 하죠. 그 풀이법이 오늘의 기술이에요.",
        onDone: finish,
      });
    }, 2400);
  });
};

/* 4 groupticket: 단체 입장권 — 요금표 2장 → 사람 줄이 하나씩 늘고 물음표 배지 팝 */
export const renderGroupticket: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  // 미니 스틱맨(줄 서는 사람): 발 y=168, 전체 높이 22
  const person = (x: number, k: number): string =>
    `<g id="gt-p${k}" opacity="0" style="transition: opacity .3s, transform .35s ${SPRING}; transform: translateY(-8px)">
      ${SHADOW(x, 169, 8, 0.09)}
      <circle cx="${x}" cy="150" r="4" fill="#FFFFFF" stroke="#2A3648" stroke-width="1.7"/>
      <path d="M${x} 154 v7 M${x} 156.5 l-4.5 4.5 M${x} 156.5 l4.5 4.5 M${x} 161 l-3.5 7 M${x} 161 l3.5 7" stroke="#2A3648" stroke-width="1.7" stroke-linecap="round" fill="none"/>
    </g>`;
  const card = (x: number, w: number, name: string, price: string, hot: boolean): string =>
    `<g>
      <rect x="${x}" y="40" width="${w}" height="56" rx="10" fill="url(#gt-card)" stroke="${hot ? "#7F4A12" : "#C4A97E"}" stroke-width="1.4"/>
      <rect x="${x}" y="40" width="${w}" height="17" rx="8.5" fill="url(#gt-head${hot ? "2" : "1"})"/>
      <rect x="${x}" y="49" width="${w}" height="8" fill="url(#gt-head${hot ? "2" : "1"})"/>
      <text x="${x + w / 2}" y="52.5" text-anchor="middle" font-size="10" font-weight="900" fill="#FFFFFF">${name}</text>
      <text x="${x + w / 2}" y="${hot ? 74 : 79}" text-anchor="middle" font-size="13" font-weight="900" fill="${hot ? "#7F4A12" : "#2A3648"}">${price}</text>
      <ellipse cx="${x + 14}" cy="44" rx="8" ry="2" fill="#fff" opacity=".45"/>
    </g>`;
  fig.innerHTML = wrapSvg(
    `${CARD}
    <path d="M24 168 h312" stroke="#B08A52" stroke-width="2.5" stroke-linecap="round" opacity=".5"/>
    ${SHADOW(91, 166, 62, 0.12)}
    <rect x="36" y="52" width="110" height="112" rx="10" fill="url(#gt-body)" stroke="#8C6A3A" stroke-width="1.5"/>
    <rect x="56" y="76" width="70" height="44" rx="8" fill="url(#gt-glass)" stroke="#3A4862" stroke-width="1.5"/>
    <path d="M66 112 l22 -28 M80 112 l16 -20" stroke="#FFFFFF" stroke-width="3" opacity=".18" stroke-linecap="round"/>
    <circle cx="91" cy="84" r="2.6" fill="#C9D6E8" opacity=".8"/>
    <rect x="52" y="120" width="78" height="7" rx="3.5" fill="url(#gt-sill)" stroke="#8C6A3A" stroke-width="1.2"/>
    <rect x="72" y="126" width="38" height="5" rx="2.5" fill="#3A4862" opacity=".55"/>
    <rect x="30" y="36" width="152" height="24" rx="8" fill="url(#gt-awn)" stroke="#7F4A12" stroke-width="1.5"/>
    <path d="M52 36 v24 M82 36 v24 M112 36 v24 M142 36 v24" stroke="#FFF6E8" stroke-width="9" opacity=".85"/>
    <rect x="30" y="36" width="152" height="24" rx="8" fill="none" stroke="#7F4A12" stroke-width="1.5"/>
    <ellipse cx="52" cy="40" rx="16" ry="2.2" fill="#fff" opacity=".4"/>
    ${card(160, 84, "개인", "4000원", false)}
    ${card(252, 92, "단체", "80000원", true)}
    <rect x="263" y="78" width="70" height="13" rx="6.5" fill="#F7E7CE" stroke="#C9A76F" stroke-width="1"/>
    <text x="298" y="87.5" text-anchor="middle" font-size="7.5" font-weight="800" fill="#7F4A12">25명분 20% 할인</text>
    ${[0, 1, 2, 3, 4, 5, 6, 7, 8].map((k) => person(168 + k * 18, k)).join("")}
    <text id="gt-dots" x="332" y="160" text-anchor="middle" font-size="13" font-weight="900" fill="#8C6E4A" opacity="0" style="transition: opacity .4s">…</text>
    <g id="gt-q" opacity="0" style="transition: opacity .4s, transform .45s ${SPRING}; transform: scale(.4); transform-origin: 310px 118px">
      <circle cx="310" cy="118" r="15" fill="url(#gt-qb)" stroke="#8C5A12" stroke-width="1.5"/>
      <text x="310" y="124.5" text-anchor="middle" font-size="17" font-weight="900" fill="#7A4A0E">?</text>
      <ellipse cx="304" cy="111" rx="5" ry="2.4" fill="#fff" opacity=".6"/>
    </g>`,
    `${BG}
    <linearGradient id="gt-awn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D9A55E"/><stop offset=".5" stop-color="#BE7F2E"/><stop offset="1" stop-color="#A9631B"/></linearGradient>
    <linearGradient id="gt-body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBF4E4"/><stop offset=".5" stop-color="#F0E1C4"/><stop offset="1" stop-color="#DFC69E"/></linearGradient>
    <linearGradient id="gt-glass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5A6E92"/><stop offset=".5" stop-color="#42557A"/><stop offset="1" stop-color="#334362"/></linearGradient>
    <linearGradient id="gt-sill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EBD9B8"/><stop offset="1" stop-color="#C9A76F"/></linearGradient>
    <linearGradient id="gt-card" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".6" stop-color="#FBF3E6"/><stop offset="1" stop-color="#F5EAD8"/></linearGradient>
    <linearGradient id="gt-head1" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#D9A55E"/><stop offset="1" stop-color="#BE7F2E"/></linearGradient>
    <linearGradient id="gt-head2" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#A9631B"/><stop offset="1" stop-color="#7F4A12"/></linearGradient>
    <radialGradient id="gt-qb" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#FFE3A6"/><stop offset=".55" stop-color="#F5C96B"/><stop offset="1" stop-color="#EDAF45"/></radialGradient>`,
  );
  const btn = mkBtn("요금표 보기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "체험관 매표소, 개인권은 <b>1인 4000원</b>. 그런데 '25명분 20% 할인 단체권'은 <b>25명이 안 돼도 살 수 있대요</b>.";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    for (let k = 0; k < 9; k++)
      window.setTimeout(() => {
        const p = q<SVGGElement>(fig, `#gt-p${k}`);
        p.style.opacity = "1";
        p.style.transform = "translateY(0)";
        if (k % 3 === 0) haptic(HAPTIC.tap);
      }, 250 + k * 110);
    window.setTimeout(() => {
      q<SVGTextElement>(fig, "#gt-dots").style.opacity = "1";
    }, 1350);
    window.setTimeout(() => {
      const qb = q<SVGGElement>(fig, "#gt-q");
      qb.style.opacity = "1";
      qb.style.transform = "scale(1)";
      haptic(HAPTIC.correct);
    }, 1550);
    window.setTimeout(() => {
      face("surprised");
      helper.innerHTML = "단체권 가격은 4000×25×0.8=80000원 정액이에요. <b>몇 명부터</b> 단체권이 유리할까요?";
      ask(box, helper, {
        choices: choices ?? ["21명부터요, 개인 합계가 80000원을 넘는 순간이죠", "25명부터요, 25명분이니까요", "20명부터요, 딱 80000원이 되는 순간요"],
        good: "정확해요! 4000x>80000을 풀면 x>20, 즉 21명부터죠. 20명은 본전(같은 값)이라 유리하다고 할 수 없어요. 부등식이 지갑을 지키는 순간이에요.",
        bad: "기준은 '개인 합계가 단체 정액보다 비싸지는 순간'이에요. 4000x>80000 → x>20. 20명은 같은 값(본전)이고 25명까지 기다릴 필요도 없어요. 21명부터! 이런 유리한 선택을 부등식으로 잡아요.",
        onDone: finish,
      });
    }, 2100);
  });
};

/* 5 fourcut: 인생네컷 — 부스 슬롯에서 3컷·4컷 스트립이 톡톡 출력되고 총 25컷 배지 */
export const renderFourcut: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  // 사진 스트립: x,y=좌상단, n=컷 수, rot=기울기, badge=컷 수 배지
  const strip = (id: string, x: number, y: number, n: number, rot: number): string => {
    const cx = x + 17;
    const h = n * 26 + 8;
    let frames = "";
    for (let k = 0; k < n; k++) {
      const fy = y + 5 + k * 26;
      frames += `<rect x="${x + 4}" y="${fy}" width="26" height="22" rx="3" fill="url(#fc-frame)" stroke="#D9C7A8" stroke-width="1"/>
        <circle cx="${cx}" cy="${fy + 10}" r="4.2" fill="#FFFFFF" stroke="#2A3648" stroke-width="1.4"/>
        <circle cx="${cx - 1.6}" cy="${fy + 9.4}" r=".7" fill="#2A3648"/><circle cx="${cx + 1.6}" cy="${fy + 9.4}" r=".7" fill="#2A3648"/>
        <path d="M${cx - 1.6} ${fy + 12} q1.6 1.4 3.2 0" stroke="#2A3648" stroke-width=".9" fill="none" stroke-linecap="round"/>`;
    }
    return `<g id="${id}" opacity="0" style="transition: opacity .4s, transform .55s ${SPRING}; transform: translate(${115 - cx}px, ${127 - y - h / 2}px) scale(.25); transform-origin: ${cx}px ${y + h / 2}px">
      <g transform="rotate(${rot} ${cx} ${y + h / 2})">
        ${SHADOW(cx, y + h + 4, 22, 0.1)}
        <rect x="${x}" y="${y}" width="34" height="${h}" rx="5" fill="url(#fc-strip)" stroke="#C9BCA6" stroke-width="1.3"/>
        ${frames}
        <ellipse cx="${x + 9}" cy="${y + 3}" rx="6" ry="1.4" fill="#fff" opacity=".6"/>
        <circle cx="${x + 2}" cy="${y + 2}" r="8" fill="url(#fc-nb)" stroke="#7F4A12" stroke-width="1.2"/>
        <text x="${x + 2}" y="${y + 5.5}" text-anchor="middle" font-size="9.5" font-weight="900" fill="#FFFFFF">${n}</text>
      </g>
    </g>`;
  };
  fig.innerHTML = wrapSvg(
    `${CARD}
    ${SHADOW(85, 170, 58, 0.12)}
    <rect x="30" y="28" width="110" height="140" rx="10" fill="url(#fc-booth)" stroke="#201509" stroke-width="1.6"/>
    ${[0, 1, 2, 3, 4].map((k) => `<circle cx="${44 + k * 21}" cy="36" r="2.5" fill="#FFD98A" stroke="#8C5A12" stroke-width=".8"/>`).join("")}
    <ellipse cx="54" cy="30.5" rx="14" ry="2" fill="#fff" opacity=".25"/>
    <rect x="40" y="44" width="52" height="116" rx="4" fill="#1A1208"/>
    <path d="M40 44 h52 v96 q-6 8 -13 0 t-13 0 t-13 0 t-13 0 z" fill="url(#fc-curtain)" stroke="#5E3A14" stroke-width="1.4"/>
    <path d="M52 48 v88 M66 48 v92 M80 48 v88" stroke="#7F4A12" stroke-width="1.2" opacity=".5" fill="none"/>
    <ellipse cx="50" cy="52" rx="5" ry="10" fill="#fff" opacity=".14"/>
    <rect x="96" y="44" width="38" height="116" rx="6" fill="url(#fc-panel)" stroke="#201509" stroke-width="1.3"/>
    <rect x="102" y="54" width="26" height="20" rx="4" fill="url(#fc-screen)" stroke="#1E2A40" stroke-width="1.2"/>
    <path d="M106 71 l9 -14" stroke="#FFFFFF" stroke-width="2.5" opacity=".25" stroke-linecap="round"/>
    <rect x="111" y="86" width="8" height="14" rx="2" fill="#1A1208"/>
    <circle cx="115" cy="112" r="5" fill="url(#fc-nb)" stroke="#7F4A12" stroke-width="1.1"/>
    <rect x="98" y="124" width="34" height="7" rx="3" fill="#14100A" stroke="#3A2B18" stroke-width="1"/>
    ${strip("fc-s1", 152, 58, 3, -6)}
    ${strip("fc-s2", 198, 44, 4, 4)}
    <g id="fc-tot" opacity="0" style="transition: opacity .4s, transform .45s ${SPRING}; transform: scale(.4); transform-origin: 290px 107px">
      <rect x="250" y="96" width="80" height="22" rx="11" fill="url(#fc-badge)" stroke="#7F4A12" stroke-width="1.4"/>
      <text x="290" y="111.5" text-anchor="middle" font-size="11" font-weight="900" fill="#FFFFFF">총 25컷</text>
      <ellipse cx="262" cy="100" rx="8" ry="2" fill="#fff" opacity=".5"/>
    </g>`,
    `${BG}
    <linearGradient id="fc-booth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5C4632"/><stop offset=".5" stop-color="#43311F"/><stop offset="1" stop-color="#2F2114"/></linearGradient>
    <linearGradient id="fc-curtain" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#C98A3F"/><stop offset=".5" stop-color="#A9631B"/><stop offset="1" stop-color="#7F4A12"/></linearGradient>
    <linearGradient id="fc-panel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7A5E42"/><stop offset=".5" stop-color="#5E4630"/><stop offset="1" stop-color="#4A3624"/></linearGradient>
    <linearGradient id="fc-screen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8FA8C8"/><stop offset=".5" stop-color="#5E7A9E"/><stop offset="1" stop-color="#42557A"/></linearGradient>
    <linearGradient id="fc-strip" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".6" stop-color="#FBF7EE"/><stop offset="1" stop-color="#F0EADC"/></linearGradient>
    <linearGradient id="fc-frame" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FBEFDD"/><stop offset=".55" stop-color="#F2DFBE"/><stop offset="1" stop-color="#E6CCA0"/></linearGradient>
    <radialGradient id="fc-nb" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#D9A55E"/><stop offset=".55" stop-color="#B4762A"/><stop offset="1" stop-color="#8C5A1E"/></radialGradient>
    <linearGradient id="fc-badge" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#C98A3F"/><stop offset=".5" stop-color="#A9631B"/><stop offset="1" stop-color="#7F4A12"/></linearGradient>`,
  );
  const btn = mkBtn("출력해 보기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "친구들과 무인 사진관에서 사진을 찍었어요. <b>3컷짜리</b> 몇 장과 <b>4컷짜리</b> 몇 장을 뽑았더니 모두 <b>25컷</b>이에요.";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    window.setTimeout(() => {
      const s1 = q<SVGGElement>(fig, "#fc-s1");
      s1.style.opacity = "1";
      s1.style.transform = "translate(0px, 0px) scale(1)";
      haptic(HAPTIC.tap);
    }, 200);
    window.setTimeout(() => {
      const s2 = q<SVGGElement>(fig, "#fc-s2");
      s2.style.opacity = "1";
      s2.style.transform = "translate(0px, 0px) scale(1)";
      haptic(HAPTIC.tap);
    }, 750);
    window.setTimeout(() => {
      const t = q<SVGGElement>(fig, "#fc-tot");
      t.style.opacity = "1";
      t.style.transform = "scale(1)";
      haptic(HAPTIC.correct);
    }, 1350);
    window.setTimeout(() => {
      face("surprised");
      helper.innerHTML = "3컷 x장, 4컷 y장이면 3x+4y=25. 이 식을 만족하는 (x, y)는 <b>몇 가지</b>일까요?";
      ask(box, helper, {
        choices: choices ?? ["여러 가지예요, (3,4)도 (7,1)도 돼요", "딱 한 가지예요, 방정식이니까요", "없어요, 25는 안 나눠떨어져요"],
        good: "맞아요! (3,4), (7,1) 등 여러 답이 가능해요. 미지수가 2개면 방정식 하나로는 답이 정해지지 않는다, 이게 오늘의 출발점이에요.",
        bad: "미지수가 1개인 방정식은 해가 하나였지만, 미지수가 2개면 이야기가 달라요. 3×3+4×4=25, 3×7+4×1=25 둘 다 성립! 해가 여러 개인 새 세계를 탐험해요.",
        onDone: finish,
      });
    }, 1950);
  });
};

/* 6 boats: 보트 6대에 14명 — 견본 두 대 관찰 → 6대 정렬 + 사람 점 14개 배지 */
export const renderBoats: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  // 나무 보트 선체: cx=중심, ty=뱃전(윗변) y, w=뱃전 반너비
  const hull = (cx: number, ty: number, w: number): string =>
    `<path d="M${cx - w} ${ty} L${cx + w} ${ty} L${cx + w - 8} ${ty + 12} Q${cx} ${ty + 17} ${cx - w + 8} ${ty + 12} Z" fill="url(#bt-hull)" stroke="#6B3F10" stroke-width="1.4"/>
    <line x1="${cx - w + 5}" y1="${ty + 4.5}" x2="${cx + w - 5}" y2="${ty + 4.5}" stroke="#8C5A1E" stroke-width="1.1" opacity=".7"/>
    <ellipse cx="${cx - w + 12}" cy="${ty + 2.5}" rx="7" ry="1.4" fill="#fff" opacity=".4"/>`;
  const head = (x: number, y: number): string =>
    `<circle cx="${x}" cy="${y}" r="3.5" fill="#FFFFFF" stroke="#2A3648" stroke-width="1.6"/>`;
  const sample = (id: string, cx: number, label: string, heads: number[]): string =>
    `<g id="${id}" style="transition: opacity .45s">
      <rect x="${cx - 21}" y="96" width="42" height="15" rx="7.5" fill="#FFFFFF" stroke="#C9A76F" stroke-width="1.2"/>
      <text x="${cx}" y="107" text-anchor="middle" font-size="8.5" font-weight="800" fill="#7F4A12">${label}</text>
      ${heads.map((dx) => head(cx + dx, 126)).join("")}
      ${hull(cx, 130, 26)}
    </g>`;
  const mystery = (id: string, cx: number, ty: number): string =>
    `<g id="${id}" opacity="0" style="transition: opacity .35s, transform .4s ${SPRING}; transform: translateY(-7px)">
      ${hull(cx, ty, 24)}
      <text x="${cx}" y="${ty + 12}" text-anchor="middle" font-size="10" font-weight="900" fill="#FFF6E8">?</text>
    </g>`;
  fig.innerHTML = wrapSvg(
    `${CARD}
    <ellipse cx="66" cy="42" rx="20" ry="8" fill="#FFFFFF" opacity=".65"/>
    <ellipse cx="84" cy="46" rx="14" ry="6" fill="#FFFFFF" opacity=".5"/>
    <ellipse cx="296" cy="34" rx="17" ry="7" fill="#FFFFFF" opacity=".55"/>
    <path d="M10 124 H350 V176 Q350 192 334 192 H26 Q10 192 10 176 Z" fill="url(#bt-water)"/>
    <path d="M10 124 H350" stroke="#3E6E9E" stroke-width="1.4" opacity=".6"/>
    <path d="M28 152 q14 -5 28 0 t28 0 M210 184 q14 -5 28 0 t28 0 M60 178 q12 -4 24 0" stroke="#DDEEFA" stroke-width="1.6" fill="none" opacity=".4" stroke-linecap="round"/>
    ${sample("bt-ex1", 100, "2인용", [-8, 8])}
    ${sample("bt-ex2", 245, "3인용", [-12, 0, 12])}
    ${mystery("bt-m0", 80, 132)}${mystery("bt-m1", 180, 132)}${mystery("bt-m2", 280, 132)}
    ${mystery("bt-m3", 80, 164)}${mystery("bt-m4", 180, 164)}${mystery("bt-m5", 280, 164)}
    <g id="bt-b6" opacity="0" style="transition: opacity .4s, transform .4s ${SPRING}; transform: scale(.5); transform-origin: 56px 108px">
      <rect x="30" y="98" width="52" height="20" rx="10" fill="url(#bt-badge)" stroke="#7F4A12" stroke-width="1.3"/>
      <text x="56" y="112" text-anchor="middle" font-size="10.5" font-weight="900" fill="#FFFFFF">6대</text>
      <ellipse cx="42" cy="101.5" rx="6" ry="1.6" fill="#fff" opacity=".5"/>
    </g>
    <g id="bt-b14" opacity="0" style="transition: opacity .4s, transform .45s ${SPRING}; transform: scale(.4); transform-origin: 267px 104px">
      ${SHADOW(267, 128, 46, 0.09)}
      <rect x="204" y="84" width="126" height="40" rx="12" fill="url(#bt-card)" stroke="#C9A76F" stroke-width="1.4"/>
      ${[0, 1, 2, 3, 4, 5, 6].map((j) => `<circle cx="${217 + j * 13.5}" cy="97" r="2.9" fill="#4E5E74"/>`).join("")}
      ${[0, 1, 2, 3, 4, 5, 6].map((j) => `<circle cx="${217 + j * 13.5}" cy="110" r="2.9" fill="#4E5E74"/>`).join("")}
      <text x="313" y="108" text-anchor="middle" font-size="10.5" font-weight="900" fill="#7F4A12">14명</text>
      <ellipse cx="218" cy="87.5" rx="9" ry="1.8" fill="#fff" opacity=".6"/>
    </g>`,
    `${BG}
    <linearGradient id="bt-water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9CCBEE"/><stop offset=".5" stop-color="#6FA8DC"/><stop offset="1" stop-color="#4E86BC"/></linearGradient>
    <linearGradient id="bt-hull" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D9A55E"/><stop offset=".5" stop-color="#B4762A"/><stop offset="1" stop-color="#8C5A1E"/></linearGradient>
    <linearGradient id="bt-badge" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#C98A3F"/><stop offset=".5" stop-color="#A9631B"/><stop offset="1" stop-color="#7F4A12"/></linearGradient>
    <linearGradient id="bt-card" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".6" stop-color="#FBF3E6"/><stop offset="1" stop-color="#F5EAD8"/></linearGradient>`,
  );
  const btn = mkBtn("보트 세어 보기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "수상 안전 교육장에 <b>2인용 보트와 3인용 보트</b>가 있어요. 오늘 빈자리 없이 <b>6대</b>를 썼고, 탄 사람은 모두 <b>14명</b>이래요.";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    q<SVGGElement>(fig, "#bt-ex1").style.opacity = "0";
    q<SVGGElement>(fig, "#bt-ex2").style.opacity = "0";
    for (let k = 0; k < 6; k++)
      window.setTimeout(() => {
        const m = q<SVGGElement>(fig, `#bt-m${k}`);
        m.style.opacity = "1";
        m.style.transform = "translateY(0)";
        if (k % 2 === 0) haptic(HAPTIC.tap);
      }, 420 + k * 130);
    window.setTimeout(() => {
      const b = q<SVGGElement>(fig, "#bt-b6");
      b.style.opacity = "1";
      b.style.transform = "scale(1)";
      haptic(HAPTIC.tap);
    }, 1350);
    window.setTimeout(() => {
      const b = q<SVGGElement>(fig, "#bt-b14");
      b.style.opacity = "1";
      b.style.transform = "scale(1)";
      haptic(HAPTIC.correct);
    }, 1650);
    window.setTimeout(() => {
      face("surprised");
      helper.innerHTML = "'6대'라는 조건 하나만으로는 조합이 여러 가지죠. 조건이 <b>두 개</b>가 되면 답은 어떻게 될까요?";
      ask(box, helper, {
        choices: choices ?? [
          "두 조건을 동시에 만족하는 조합 하나로 좁혀져요",
          "여전히 여러 가지예요, 조건은 참고일 뿐이죠",
          "답이 아예 없어져요, 조건이 많아지면 모순이라서요",
        ],
        good: "그렇죠! 대수 조건의 조합 중에서 인원 조건까지 만족하는 건 단 하나뿐이에요. 조건 두 개를 겹쳐 답 하나를 찾는 것, 그게 연립방정식이에요.",
        bad: "조건이 늘면 답은 줄어요. 6대를 만드는 조합 다섯 가지 중 14명까지 맞는 건 딱 하나! 두 조건의 교집합을 찾는 기술, 연립방정식을 배워요.",
        onDone: finish,
      });
    }, 2250);
  });
};

/* 7 bingsu: 빙수 가격 — 지워진 메뉴판 → 힌트 카드 2장이 팔랑 등장(+3000 화살표, 합계 30000) */
export const renderBingsu: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  // 빙수 그릇: cx, by=그릇 바닥 y, s=스케일, fruit=과일빙수(아니면 팥빙수)
  const bowl = (cx: number, by: number, s: number, fruit: boolean): string => {
    const w = 20 * s;
    const top = fruit
      ? `<circle cx="${cx - 6 * s}" cy="${by - 26 * s}" r="${3.2 * s}" fill="#E85A6B" stroke="#B03A4A" stroke-width="1"/>
         <circle cx="${cx + 5 * s}" cy="${by - 24 * s}" r="${3 * s}" fill="#FFD98A" stroke="#C99B3E" stroke-width="1"/>
         <circle cx="${cx}" cy="${by - 31 * s}" r="${2.7 * s}" fill="#8FBF5A" stroke="#5E8A34" stroke-width="1"/>`
      : `<ellipse cx="${cx}" cy="${by - 25 * s}" rx="${12 * s}" ry="${7 * s}" fill="url(#bs-bean)" stroke="#4A2416" stroke-width="1.2"/>
         <ellipse cx="${cx - 4 * s}" cy="${by - 26 * s}" rx="${1.8 * s}" ry="${1.2 * s}" fill="#54281A"/>
         <ellipse cx="${cx + 4 * s}" cy="${by - 24 * s}" rx="${1.8 * s}" ry="${1.2 * s}" fill="#54281A"/>`;
    return `<circle cx="${cx - 7 * s}" cy="${by - 20 * s}" r="${9 * s}" fill="url(#bs-ice)" stroke="#C8D4E0" stroke-width="1.2"/>
      <circle cx="${cx + 7 * s}" cy="${by - 20 * s}" r="${9 * s}" fill="url(#bs-ice)" stroke="#C8D4E0" stroke-width="1.2"/>
      <circle cx="${cx}" cy="${by - 26 * s}" r="${10 * s}" fill="url(#bs-ice)" stroke="#C8D4E0" stroke-width="1.2"/>
      ${top}
      <path d="M${cx - w} ${by - 14 * s} L${cx + w} ${by - 14 * s} L${cx + w * 0.6} ${by} Q${cx} ${by + 3 * s} ${cx - w * 0.6} ${by} Z" fill="url(#bs-cup)" stroke="#5E7288" stroke-width="1.3"/>
      <path d="M${cx - w * 0.55} ${by - 11 * s} L${cx - w * 0.34} ${by - 2 * s}" stroke="#FFFFFF" stroke-width="${2 * s}" opacity=".5" stroke-linecap="round"/>`;
  };
  const smudge = (cx: number, cy: number): string =>
    `<ellipse cx="${cx}" cy="${cy}" rx="17" ry="6" fill="#B8A88E" opacity=".5"/>
     <ellipse cx="${cx + 6}" cy="${cy - 2}" rx="11" ry="4.5" fill="#C8B99E" opacity=".4"/>
     <ellipse cx="${cx - 8}" cy="${cy + 2}" rx="9" ry="4" fill="#A89878" opacity=".4"/>`;
  fig.innerHTML = wrapSvg(
    `${CARD}
    ${SHADOW(116, 186, 84, 0.12)}
    <path d="M60 168 l-9 16 M172 168 l9 16" stroke="#6B4E2A" stroke-width="3" stroke-linecap="round"/>
    <rect x="26" y="24" width="180" height="144" rx="12" fill="url(#bs-board)" stroke="#201709" stroke-width="1.6"/>
    <rect x="34" y="32" width="164" height="128" rx="8" fill="none" stroke="#6B573E" stroke-width="1.2" opacity=".6"/>
    <ellipse cx="62" cy="38" rx="18" ry="3" fill="#fff" opacity=".12"/>
    ${bowl(72, 96, 1.4, false)}
    ${bowl(160, 96, 1.4, true)}
    <text x="72" y="118" text-anchor="middle" font-size="9.5" font-weight="800" fill="#F4E8D4">팥빙수</text>
    <text x="160" y="118" text-anchor="middle" font-size="9.5" font-weight="800" fill="#F4E8D4">과일빙수</text>
    ${smudge(72, 138)}
    ${smudge(160, 138)}
    <g id="bs-h1" opacity="0" style="transition: opacity .45s, transform .55s ${SPRING}; transform: translate(26px, -20px) rotate(10deg); transform-origin: 277px 64px">
      <g transform="rotate(-2 277 64)">
        ${SHADOW(277, 96, 56, 0.1)}
        <rect x="214" y="36" width="126" height="56" rx="10" fill="url(#bs-card)" stroke="#C9A76F" stroke-width="1.4"/>
        <ellipse cx="230" cy="40" rx="10" ry="1.8" fill="#fff" opacity=".6"/>
        ${bowl(238, 78, 0.8, false)}
        ${bowl(316, 78, 0.8, true)}
        <path d="M258 62 Q277 48 294 58" stroke="#7F4A12" stroke-width="2" fill="none"/>
        <path d="M294 58 l-7 -3.5 l1.6 6 z" fill="#7F4A12"/>
        <rect x="254" y="40" width="46" height="15" rx="7.5" fill="url(#bs-pill)" stroke="#7F4A12" stroke-width="1.1"/>
        <text x="277" y="51" text-anchor="middle" font-size="8.5" font-weight="900" fill="#FFFFFF">+3000원</text>
      </g>
    </g>
    <g id="bs-h2" opacity="0" style="transition: opacity .45s, transform .55s ${SPRING}; transform: translate(30px, -12px) rotate(-9deg); transform-origin: 277px 132px">
      <g transform="rotate(2 277 132)">
        ${SHADOW(277, 164, 56, 0.1)}
        <rect x="214" y="104" width="126" height="56" rx="10" fill="url(#bs-card)" stroke="#C9A76F" stroke-width="1.4"/>
        <ellipse cx="230" cy="108" rx="10" ry="1.8" fill="#fff" opacity=".6"/>
        ${bowl(232, 136, 0.7, false)}
        <text x="246" y="140" font-size="9.5" font-weight="900" fill="#2A3648">×2</text>
        <text x="260" y="140" font-size="9.5" font-weight="900" fill="#8C6E4A">+</text>
        ${bowl(280, 136, 0.7, true)}
        <text x="293" y="140" font-size="9.5" font-weight="900" fill="#2A3648">×1</text>
        <text x="327" y="154" text-anchor="end" font-size="10.5" font-weight="900" fill="#7F4A12">= 30000원</text>
      </g>
    </g>`,
    `${BG}
    <linearGradient id="bs-board" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5A4634"/><stop offset=".5" stop-color="#423324"/><stop offset="1" stop-color="#2F2318"/></linearGradient>
    <linearGradient id="bs-cup" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#F2F7FC"/><stop offset=".5" stop-color="#D8E4EE"/><stop offset="1" stop-color="#BCCCDA"/></linearGradient>
    <radialGradient id="bs-ice" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".6" stop-color="#F2F6FA"/><stop offset="1" stop-color="#DCE6EE"/></radialGradient>
    <radialGradient id="bs-bean" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#8A4A34"/><stop offset=".55" stop-color="#6E3624"/><stop offset="1" stop-color="#54281A"/></radialGradient>
    <linearGradient id="bs-card" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".6" stop-color="#FBF3E6"/><stop offset="1" stop-color="#F5EAD8"/></linearGradient>
    <linearGradient id="bs-pill" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#C98A3F"/><stop offset=".5" stop-color="#A9631B"/><stop offset="1" stop-color="#7F4A12"/></linearGradient>`,
  );
  const btn = mkBtn("주문서 보기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML =
    "빙수 가게 메뉴판이 지워져 가격이 안 보여요. 사장님 힌트: <b>과일빙수는 팥빙수보다 3000원 비싸고</b>, 팥빙수 2그릇+과일빙수 1그릇은 <b>30000원</b>이래요.";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    window.setTimeout(() => {
      const h1 = q<SVGGElement>(fig, "#bs-h1");
      h1.style.opacity = "1";
      h1.style.transform = "translate(0px, 0px) rotate(0deg)";
      haptic(HAPTIC.tap);
    }, 200);
    window.setTimeout(() => {
      const h2 = q<SVGGElement>(fig, "#bs-h2");
      h2.style.opacity = "1";
      h2.style.transform = "translate(0px, 0px) rotate(0deg)";
      haptic(HAPTIC.tap);
    }, 700);
    window.setTimeout(() => {
      face("surprised");
      helper.innerHTML = "팥빙수를 x원이라 하면 과일빙수는 (x+3000)원. 이걸 <b>2x+y=30000의 y 자리에 통째로 넣으면</b> 어떻게 될까요?";
      ask(box, helper, {
        choices: choices ?? [
          "미지수가 x 하나만 남아서 풀 수 있게 돼요",
          "미지수가 3개로 늘어나요",
          "식이 틀려져요, y 자리에 식을 넣으면 안 돼요",
        ],
        good: "바로 그거예요! 2x+(x+3000)=30000, y가 사라지고 x만 남죠. 식을 통째로 꽂아 미지수를 지우는 기술, 대입법이에요.",
        bad: "y 자리에 'y와 같은 것'을 넣는 건 완벽히 합법이에요. 2x+(x+3000)=30000이 되어 미지수가 x 하나로 줄죠. 이 꽂아넣기 기술을 랩에서 직접 해 봐요.",
        onDone: finish,
      });
    }, 1500);
  });
};

/* 8 combo: 세트 메뉴 두 장 — 카드가 세로로 정렬되고 같은 어묵끼리 점선 연결 */
export const renderCombo: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  const gimbap = (cx: number, cy: number): string =>
    `<circle cx="${cx}" cy="${cy}" r="8.5" fill="url(#cb-nori)" stroke="#15150F" stroke-width="1.4"/>
     <circle cx="${cx}" cy="${cy}" r="5.4" fill="#FBF7EA"/>
     <circle cx="${cx - 1.9}" cy="${cy - 1.6}" r="1.5" fill="#E8963E"/>
     <circle cx="${cx + 2.1}" cy="${cy - 0.4}" r="1.4" fill="#7FA845"/>
     <circle cx="${cx - 0.2}" cy="${cy + 2.3}" r="1.5" fill="#F2CE5A"/>
     <ellipse cx="${cx - 3}" cy="${cy - 5.6}" rx="2.6" ry="1" fill="#fff" opacity=".4"/>`;
  const eomuk = (cx: number, cy: number): string =>
    `<line x1="${cx}" y1="${cy - 14}" x2="${cx}" y2="${cy + 15}" stroke="#B08A52" stroke-width="2.2" stroke-linecap="round"/>
     <ellipse cx="${cx}" cy="${cy - 7}" rx="8" ry="4.2" fill="url(#cb-fish)" stroke="#9C6E32" stroke-width="1.2"/>
     <ellipse cx="${cx}" cy="${cy}" rx="8" ry="4.2" fill="url(#cb-fish)" stroke="#9C6E32" stroke-width="1.2"/>
     <ellipse cx="${cx}" cy="${cy + 7}" rx="8" ry="4.2" fill="url(#cb-fish)" stroke="#9C6E32" stroke-width="1.2"/>
     <ellipse cx="${cx - 2.5}" cy="${cy - 8.5}" rx="2.6" ry="1" fill="#fff" opacity=".5"/>`;
  const setCard = (id: string, y: number, name: string, hot: boolean, rows: string, price: string): string =>
    `<g id="${id}" style="transition: transform .6s ${SPRING}">
      ${SHADOW(180, y + 62, 62, 0.11)}
      <rect x="110" y="${y}" width="140" height="58" rx="10" fill="url(#cb-card)" stroke="#C9A76F" stroke-width="1.4"/>
      <circle cx="124" cy="${y + 13}" r="8" fill="url(#cb-badge${hot ? "2" : "1"})" stroke="#7F4A12" stroke-width="1.2"/>
      <text x="124" y="${y + 16.8}" text-anchor="middle" font-size="9.5" font-weight="900" fill="#FFFFFF">${name}</text>
      <ellipse cx="146" cy="${y + 4}" rx="12" ry="1.8" fill="#fff" opacity=".6"/>
      ${rows}
      <text x="242" y="${y + 50}" text-anchor="end" font-size="11.5" font-weight="900" fill="#2A3648">${price}</text>
    </g>`;
  fig.innerHTML = wrapSvg(
    `${CARD}
    ${setCard("cb-a", 30, "A", false, `${gimbap(134, 58)}${gimbap(156, 58)}${eomuk(196, 58)}`, "7000원")}
    ${setCard("cb-b", 104, "B", true, `${gimbap(134, 132)}${eomuk(196, 132)}`, "4500원")}
    <g id="cb-link" opacity="0" style="transition: opacity .5s">
      <line x1="196" y1="76" x2="196" y2="114" stroke="#0B7A4A" stroke-width="2" stroke-dasharray="5 4"/>
      <circle cx="196" cy="58" r="13" fill="none" stroke="#0B7A4A" stroke-width="1.8" stroke-dasharray="4 3"/>
      <circle cx="196" cy="132" r="13" fill="none" stroke="#0B7A4A" stroke-width="1.8" stroke-dasharray="4 3"/>
      <rect x="212" y="88" width="52" height="15" rx="7.5" fill="#E9F8F0" stroke="#57C793" stroke-width="1.2"/>
      <text x="238" y="99" text-anchor="middle" font-size="8.5" font-weight="900" fill="#0B7A4A">같은 어묵</text>
    </g>
    <g id="cb-gap" opacity="0" style="transition: opacity .5s, transform .45s ${SPRING}; transform: scale(.5); transform-origin: 156px 58px">
      <circle cx="156" cy="58" r="12" fill="none" stroke="#A9631B" stroke-width="1.8" stroke-dasharray="4 3"/>
      <rect x="120" y="76" width="72" height="15" rx="7.5" fill="#F7E7CE" stroke="#C9A76F" stroke-width="1.1"/>
      <text x="156" y="87" text-anchor="middle" font-size="8.5" font-weight="900" fill="#7F4A12">차이는 김밥 한 줄</text>
    </g>`,
    `${BG}
    <linearGradient id="cb-card" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".6" stop-color="#FBF3E6"/><stop offset="1" stop-color="#F5EAD8"/></linearGradient>
    <radialGradient id="cb-nori" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#4A4A3A"/><stop offset=".55" stop-color="#2E2E24"/><stop offset="1" stop-color="#1C1C14"/></radialGradient>
    <linearGradient id="cb-fish" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2D9AC"/><stop offset=".5" stop-color="#E0B476"/><stop offset="1" stop-color="#C89250"/></linearGradient>
    <radialGradient id="cb-badge1" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#D9A55E"/><stop offset=".55" stop-color="#B4762A"/><stop offset="1" stop-color="#8C5A1E"/></radialGradient>
    <radialGradient id="cb-badge2" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#C98A3F"/><stop offset=".55" stop-color="#A9631B"/><stop offset="1" stop-color="#7F4A12"/></radialGradient>`,
  );
  // 시작은 두 장이 비스듬히 겹친 상태, 조작하면 세로로 착 정렬된다
  const ca = q<SVGGElement>(fig, "#cb-a");
  const cb = q<SVGGElement>(fig, "#cb-b");
  ca.style.transformOrigin = "180px 59px";
  cb.style.transformOrigin = "180px 133px";
  ca.style.transform = "translate(-52px, 26px) rotate(-6deg)";
  cb.style.transform = "translate(52px, -26px) rotate(5deg)";
  const btn = mkBtn("영수증 겹치기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "분식 세트 A는 <b>김밥 2줄+어묵 1컵에 7000원</b>, 세트 B는 <b>김밥 1줄+어묵 1컵에 4500원</b>이에요. 김밥 한 줄 값이 궁금해요.";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    ca.style.transform = "translate(0px, 0px) rotate(0deg)";
    cb.style.transform = "translate(0px, 0px) rotate(0deg)";
    window.setTimeout(() => {
      q<SVGGElement>(fig, "#cb-link").style.opacity = "1";
      haptic(HAPTIC.tap);
    }, 750);
    window.setTimeout(() => {
      const g = q<SVGGElement>(fig, "#cb-gap");
      g.style.opacity = "1";
      g.style.transform = "scale(1)";
      haptic(HAPTIC.tap);
    }, 1400);
    window.setTimeout(() => {
      face("surprised");
      helper.innerHTML = "두 세트의 차이는 <b>김밥 한 줄</b>뿐이에요. 두 식을 <b>변끼리 빼면</b> 무엇이 남을까요?";
      ask(box, helper, {
        choices: choices ?? [
          "어묵이 지워지고 김밥 한 줄 값 2500원이 남아요",
          "아무것도 안 남아요, 식끼리는 못 빼요",
          "어묵 값이 남아요, 김밥이 지워지니까요",
        ],
        good: "정확해요! 같은 어묵 1컵끼리 상쇄되고 김밥 한 줄=2500원이 툭 떨어져요. 변끼리 빼서 미지수를 지우는 기술, 가감법이에요.",
        bad: "식은 저울과 같아서 변끼리 빼도 균형이 유지돼요. 같은 어묵끼리 지워지고 남는 건 김밥 한 줄 값 2500원! 빼서(때론 더해서) 지우는 가감법을 배워요.",
        onDone: finish,
      });
    }, 2100);
  });
};

/* 9 pheasant: 손자산경 — 두루마리가 펼쳐지며(폭 성장은 setTimeout 체인) 머리 35·다리 94 배지 팝 */
export const renderPheasant: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  const rod = (x: number): string =>
    `<rect x="${x}" y="32" width="10" height="80" rx="4" fill="url(#ph-rod)" stroke="#4A2C0A" stroke-width="1.4"/>
     <circle cx="${x + 5}" cy="30" r="4" fill="url(#ph-rod)" stroke="#4A2C0A" stroke-width="1.2"/>
     <circle cx="${x + 5}" cy="114" r="4" fill="url(#ph-rod)" stroke="#4A2C0A" stroke-width="1.2"/>
     <ellipse cx="${x + 3.5}" cy="44" rx="1.6" ry="10" fill="#fff" opacity=".3"/>`;
  // 옛 글씨 흉내 세로 획 열(글자 아님, 질감)
  const cols = [80, 100, 120, 140, 160, 180, 200, 220, 240]
    .map((x, c) => `<path d="M${x} ${52 + (c % 3) * 2} v${8 + (c % 3) * 2} M${x} 68 v${12 - (c % 3) * 2} M${x} ${86 - (c % 2) * 3} v${7 + (c % 2) * 3}" stroke="#8A6E42" stroke-width="1.7" stroke-linecap="round"/>`)
    .join("");
  fig.innerHTML = wrapSvg(
    `${CARD}
    <path d="M28 118 h230" stroke="#B08A52" stroke-width="2.2" stroke-linecap="round" opacity=".45"/>
    ${SHADOW(150, 118, 92, 0.1)}
    <rect id="ph-paper" x="54" y="40" width="6" height="64" fill="url(#ph-paper)" stroke="#B89A62" stroke-width="1.3"/>
    <g id="ph-txt" opacity="0" style="transition: opacity .6s">${cols}</g>
    ${rod(44)}
    <g id="ph-roll" style="transition: transform .09s linear">${rod(58)}</g>
    <g id="ph-b1" opacity="0" style="transition: opacity .4s, transform .45s ${SPRING}; transform: scale(.4); transform-origin: 107px 58px">
      <rect x="78" y="48" width="58" height="20" rx="10" fill="url(#ph-badge)" stroke="#7F4A12" stroke-width="1.3"/>
      <text x="107" y="62" text-anchor="middle" font-size="10.5" font-weight="900" fill="#FFFFFF">머리 35</text>
      <ellipse cx="92" cy="51.5" rx="7" ry="1.6" fill="#fff" opacity=".5"/>
    </g>
    <g id="ph-b2" opacity="0" style="transition: opacity .4s, transform .45s ${SPRING}; transform: scale(.4); transform-origin: 177px 82px">
      <rect x="148" y="72" width="58" height="20" rx="10" fill="url(#ph-badge)" stroke="#7F4A12" stroke-width="1.3"/>
      <text x="177" y="86" text-anchor="middle" font-size="10.5" font-weight="900" fill="#FFFFFF">다리 94</text>
      <ellipse cx="162" cy="75.5" rx="7" ry="1.6" fill="#fff" opacity=".5"/>
    </g>
    ${SHADOW(300, 184, 44, 0.12)}
    <circle cx="278" cy="124" r="7" fill="url(#ph-bird)" stroke="#1C3624" stroke-width="1.4"/>
    <path d="M285 122 l6 2 -6 3 z" fill="#E8B45A" stroke="#A9771C" stroke-width="1"/>
    <circle cx="276.5" cy="122" r="1.1" fill="#10241A"/>
    <circle cx="300" cy="119" r="6.5" fill="url(#ph-bird)" stroke="#1C3624" stroke-width="1.4"/>
    <path d="M294 117.5 l-6 2 6 2.6 z" fill="#E8B45A" stroke="#A9771C" stroke-width="1"/>
    <circle cx="301.5" cy="117" r="1.1" fill="#10241A"/>
    <g transform="rotate(-8 317 112)"><ellipse cx="317" cy="112" rx="3.6" ry="12" fill="url(#ph-rab)" stroke="#8C6E4A" stroke-width="1.3"/><ellipse cx="317" cy="113" rx="1.6" ry="8" fill="#E8A9A0" opacity=".8"/></g>
    <g transform="rotate(10 327 112)"><ellipse cx="327" cy="112" rx="3.6" ry="12" fill="url(#ph-rab)" stroke="#8C6E4A" stroke-width="1.3"/><ellipse cx="327" cy="113" rx="1.6" ry="8" fill="#E8A9A0" opacity=".8"/></g>
    <circle cx="322" cy="128" r="7.5" fill="url(#ph-rab)" stroke="#8C6E4A" stroke-width="1.4"/>
    <circle cx="319.5" cy="127" r="1.1" fill="#3A2A18"/><circle cx="324.5" cy="127" r="1.1" fill="#3A2A18"/>
    <rect x="262" y="132" width="76" height="10" rx="5" fill="url(#ph-rim)" stroke="#6B4E2A" stroke-width="1.4"/>
    <path d="M266 142 h68 l-7 32 q-27 10 -54 0 z" fill="url(#ph-basket)" stroke="#6B4E2A" stroke-width="1.5"/>
    <path d="M270 152 q30 8 60 0 M273 164 q27 7 54 0" stroke="#6B4E2A" stroke-width="1.1" fill="none" opacity=".55"/>
    <path d="M280 144 v26 M300 146 v28 M320 144 v26" stroke="#6B4E2A" stroke-width="1" opacity=".35"/>
    <ellipse cx="278" cy="136" rx="10" ry="1.8" fill="#fff" opacity=".35"/>`,
    `${BG}
    <linearGradient id="ph-paper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7EDD2"/><stop offset=".55" stop-color="#EDDCB2"/><stop offset="1" stop-color="#DEC68E"/></linearGradient>
    <linearGradient id="ph-rod" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#B4762A"/><stop offset=".5" stop-color="#8C5A1E"/><stop offset="1" stop-color="#6B3F10"/></linearGradient>
    <linearGradient id="ph-basket" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D9A55E"/><stop offset=".5" stop-color="#B4762A"/><stop offset="1" stop-color="#8C5A1E"/></linearGradient>
    <linearGradient id="ph-rim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E4B36A"/><stop offset=".5" stop-color="#C98A3F"/><stop offset="1" stop-color="#A9631B"/></linearGradient>
    <radialGradient id="ph-bird" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#5E8A5E"/><stop offset=".55" stop-color="#3E6B4A"/><stop offset="1" stop-color="#2A4E34"/></radialGradient>
    <linearGradient id="ph-rab" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBF4E6"/><stop offset=".55" stop-color="#EFE0C8"/><stop offset="1" stop-color="#DEC8A6"/></linearGradient>
    <linearGradient id="ph-badge" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#C98A3F"/><stop offset=".5" stop-color="#A9631B"/><stop offset="1" stop-color="#7F4A12"/></linearGradient>`,
  );
  const btn = mkBtn("옛 문제 펼치기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML =
    "1500년 전 중국의 수학책 <b>『손자산경』</b>에 이런 문제가 있어요: 꿩과 토끼가 한 바구니에 있는데 <b>머리는 35, 다리는 94</b>래요.";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    const paper = q<SVGRectElement>(fig, "#ph-paper");
    const roll = q<SVGGElement>(fig, "#ph-roll");
    // width 속성은 CSS 트랜지션이 안 걸리므로 setTimeout 스텝 체인으로 펼친다
    let w = 6;
    const grow = (): void => {
      w = Math.min(200, w + 14);
      paper.setAttribute("width", String(w));
      roll.style.transform = `translateX(${w - 6}px)`;
      if (w < 200) window.setTimeout(grow, 80);
      else {
        q<SVGGElement>(fig, "#ph-txt").style.opacity = "1";
        haptic(HAPTIC.tap);
      }
    };
    window.setTimeout(grow, 150);
    window.setTimeout(() => {
      const b = q<SVGGElement>(fig, "#ph-b1");
      b.style.opacity = "1";
      b.style.transform = "scale(1)";
      haptic(HAPTIC.tap);
    }, 1650);
    window.setTimeout(() => {
      const b = q<SVGGElement>(fig, "#ph-b2");
      b.style.opacity = "1";
      b.style.transform = "scale(1)";
      haptic(HAPTIC.correct);
    }, 1950);
    window.setTimeout(() => {
      face("surprised");
      helper.innerHTML = "꿩은 다리 2개, 토끼는 4개예요. 이 문제, 오늘 우리가 배운 무기로 잡는다면 <b>어떤 식</b>을 세울까요?";
      ask(box, helper, {
        choices: choices ?? [
          "x+y=35와 2x+4y=94, 연립방정식이요",
          "x+y=94 하나면 충분해요",
          "35×4−94 같은 계산 한 번이면 돼요, 식은 필요 없어요",
        ],
        good: "완벽해요! 머리 조건과 다리 조건, 두 식을 연립하면 꿩 23마리, 토끼 12마리가 나와요. 1500년 전 문제가 오늘 배운 기술로 풀리는 순간이에요.",
        bad: "조건이 둘(머리 수·다리 수)이니 식도 둘이 필요해요. x+y=35, 2x+4y=94를 연립하면 꿩 23, 토끼 12! 옛사람의 기발한 암산법과 우리의 연립방정식을 레슨에서 비교해 봐요.",
        onDone: finish,
      });
    }, 2550);
  });
};
