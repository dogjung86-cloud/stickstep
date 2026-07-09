// hookMath2, Ⅱ 문자와 식 훅 장면 9종. hookMath.ts의 mathHook이 디스패치한다.
// 장면 계약: (scene, helper, finish, face, choices?), 공용 hookAsk.ask()만 사용,
// choices[0]=정답, good≠bad(오개념 교정), 소재명·설정은 도입(helper/narrator)에서 소개.
// 상태 변화는 인라인 스타일 트랜지션(rAF 금지). SVG는 파운드리 문법:
// 3스톱 그라데이션 면 + 키라이트 + 접촉 그림자(#2A3A5E) + 재질별 최암색 외곽선.
import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { ask } from "./hookAsk";
import { mfmt } from "../../ui/mathKit";
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

/** 8꼭짓점 별(만남·변신 플래시). */
function star(cx: number, cy: number, rOut: number, rIn: number, fill: string, stroke: string): string {
  let d = "";
  for (let i = 0; i < 16; i++) {
    const r = i % 2 === 0 ? rOut : rIn;
    const a = (Math.PI * i) / 8 - Math.PI / 2;
    d += `${i === 0 ? "M" : "L"}${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)} `;
  }
  return `<path d="${d}Z" fill="${fill}" stroke="${stroke}" stroke-width="1.2"/>`;
}

/* ── 1 vending, 빈 병 보증금 회수기(문자의 필요) ────────────── */
export const renderVending: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  const BXS = [64, 106, 148];
  const bottle = (bx: number, i: number): string =>
    `<g class="vd-b${i}" style="transition: transform .75s cubic-bezier(.45,.05,.55,1), opacity .35s ease .5s; transform-origin: ${bx}px 158px">
      <rect x="${bx - 11}" y="138" width="22" height="42" rx="7" fill="url(#vd-pl)" stroke="#5E86A4" stroke-width="1.4"/>
      <rect x="${bx - 11}" y="156" width="22" height="9" fill="#FFFFFF" opacity=".55"/>
      <rect x="${bx - 6}" y="128" width="12" height="11" rx="3" fill="#2FA8C4" stroke="#17708C" stroke-width="1.2"/>
      <line x1="${bx - 5.5}" y1="144" x2="${bx - 5.5}" y2="173" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".5"/>
    </g>`;
  fig.innerHTML = wrapSvg(
    `${SHADOW(268, 184, 66)}${SHADOW(106, 184, 58, 0.09)}
    <line x1="20" y1="180" x2="340" y2="180" stroke="#8CA0B3" stroke-width="2" stroke-linecap="round"/>
    <rect x="204" y="26" width="128" height="154" rx="16" fill="url(#vd-bd)" stroke="#0B5E3E" stroke-width="1.8"/>
    <rect x="210" y="34" width="7" height="132" rx="3.5" fill="#fff" opacity=".14"/>
    <ellipse cx="228" cy="36" rx="13" ry="5" fill="#fff" opacity=".32"/>
    <rect x="218" y="40" width="100" height="30" rx="8" fill="#12241C" stroke="#0B1A13" stroke-width="1.2"/>
    <text class="vd-cnt" x="268" y="61" text-anchor="middle" font-size="16" font-weight="900" fill="#7FE0D2">0원</text>
    <rect x="216" y="84" width="66" height="42" rx="10" fill="#0F3A2A" stroke="#0B2E20" stroke-width="1.4"/>
    <ellipse cx="249" cy="105" rx="25" ry="13" fill="#071F15"/>
    <rect x="296" y="90" width="14" height="28" rx="5" stroke="#EAF6FF" stroke-width="2" opacity=".5"/>
    <rect x="300" y="83" width="6" height="7" rx="2" fill="#EAF6FF" opacity=".5"/>
    <rect x="230" y="146" width="48" height="14" rx="7" fill="#0F3A2A" stroke="#0B2E20" stroke-width="1.2"/>
    ${BXS.map((bx, i) => bottle(bx, i)).join("")}`,
    `<linearGradient id="vd-bd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7FE8C0"/><stop offset=".55" stop-color="#2DB97E"/><stop offset="1" stop-color="#128A5C"/></linearGradient>
    <linearGradient id="vd-pl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#F2FAFF"/><stop offset=".5" stop-color="#C9E4F6"/><stop offset="1" stop-color="#9CC8E4"/></linearGradient>`,
  );
  const btn = mkBtn("병 넣기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "빈 병을 넣으면 <b>1병에 100원</b>씩 보증금을 돌려주는 무인 회수기예요. 병을 하나씩 넣어 볼까요?";
  let n = 0;
  btn.addEventListener("click", () => {
    if (n >= 3) return;
    n += 1;
    haptic(HAPTIC.select);
    const i = 3 - n; // 기계와 가까운 병부터 들어간다
    const bx = BXS[i];
    const b = fig.querySelector(`.vd-b${i}`) as SVGGElement;
    b.style.transform = `translate(${249 - bx}px, -54px) rotate(92deg) scale(.62)`;
    b.style.opacity = "0";
    const paid = n;
    window.setTimeout(() => {
      (fig.querySelector(".vd-cnt") as SVGTextElement).textContent = `${paid * 100}원`;
      haptic(HAPTIC.tap);
    }, 560);
    if (n === 3) {
      btn.disabled = true;
      btn.classList.remove("pulse");
      window.setTimeout(() => {
        face("surprised");
        helper.innerHTML = "1병에 100원, 그럼 <b>100병</b>이면? <b>3752병</b>이면? 매번 그림을 그려 셀 순 없죠. 회수기의 계산 비법은 뭘까요?";
        window.setTimeout(() => {
          ask(box, helper, {
            choices: choices ?? [
              "개수를 문자 x로 두고 100×x원, 한 줄로 끝",
              "100병 그림을 그려서 센다",
              "그때그때 계산기를 두드린다",
            ],
            good: "바로 그거예요! 개수에 <b>x</b>라는 이름을 붙이면 10병이든 3752병이든 <b>100×x원</b> 한 줄로 끝, 문자 하나가 모든 개수를 대신해요. 오늘의 발명품이에요.",
            bad: "그림도 계산기도 개수가 바뀔 때마다 <b>처음부터 다시</b> 해야 해요. 개수를 x로 이름 붙이면 <b>100×x원</b> 한 줄로 전부 커버, 그게 문자의 힘이에요!",
            onDone: finish,
          });
        }, 700);
      }, 800);
    }
  });
};

/* ── 2 chatslang, 줄임말의 민족(기호 생략) ──────────────────── */
export const renderChatslang: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  const frB = (x: number, y: number, w: number, t: string): string =>
    `<rect x="${x}" y="${y}" width="${w}" height="32" rx="13" fill="url(#cs-fr)" stroke="#D0D9E2" stroke-width="1.3"/>
     <text x="${x + w / 2}" y="${y + 21}" text-anchor="middle" font-size="14.5" font-weight="800" fill="#1E2A38">${t}</text>`;
  const meB = (x: number, y: number, w: number, t: string): string =>
    `<rect x="${x}" y="${y}" width="${w}" height="32" rx="13" fill="url(#cs-me)" stroke="#8FC2E8" stroke-width="1.3"/>
     <text x="${x + w / 2}" y="${y + 21}" text-anchor="middle" font-size="14.5" font-weight="800" fill="#0A5E8C">${t}</text>`;
  fig.innerHTML = wrapSvg(
    `${SHADOW(180, 196, 86, 0.1)}
    <rect x="58" y="8" width="244" height="186" rx="18" fill="url(#cs-ph)" stroke="#39424E" stroke-width="2.2"/>
    <ellipse cx="84" cy="14.5" rx="14" ry="3" fill="#fff" opacity=".5"/>
    <rect x="74" y="20" width="212" height="26" rx="9" fill="#EEF3F8" stroke="#D5DDE6" stroke-width="1.2"/>
    <circle cx="90" cy="33" r="8" fill="url(#cs-av)" stroke="#C4841E" stroke-width="1.2"/>
    <path d="M87 31.5 h1.6 M91.4 31.5 h1.6 M87.5 35.5 q2.5 1.8 5 0" stroke="#7A5210" stroke-width="1.2" fill="none" stroke-linecap="round"/>
    <circle cx="268" cy="33" r="2" fill="#B9C6D2"/><circle cx="275" cy="33" r="2" fill="#B9C6D2"/>
    <g class="cs-s" style="transition: opacity .45s ease">
      ${frB(74, 56, 86, "ㅊㅋㅊㅋ")}
      ${meB(220, 98, 66, "ㄱㅅ")}
      ${frB(74, 140, 66, "ㅇㅋ")}
    </g>
    <g class="cs-l" style="transition: opacity .45s ease; opacity: 0">
      ${frB(74, 56, 104, "축하 축하")}
      ${meB(212, 98, 74, "감사")}
      ${frB(74, 140, 86, "오케이")}
    </g>`,
    `<linearGradient id="cs-ph" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".5" stop-color="#F2F6FA"/><stop offset="1" stop-color="#E4EBF3"/></linearGradient>
    <linearGradient id="cs-fr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6F9FC"/><stop offset="1" stop-color="#E9EFF5"/></linearGradient>
    <linearGradient id="cs-me" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#DDF0FF"/><stop offset="1" stop-color="#BFE0FA"/></linearGradient>
    <radialGradient id="cs-av" cx=".38" cy=".3" r=".95"><stop offset="0" stop-color="#FFD98A"/><stop offset="1" stop-color="#F2A93B"/></radialGradient>`,
  );
  const btn = mkBtn("원래 말로 보기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "친구들의 채팅이에요, <b>ㅊㅋㅊㅋ, ㄱㅅ, ㅇㅋ</b>. 다들 줄임말로도 찰떡같이 알아듣죠. 원래 말로 펼쳐 볼까요?";
  let expanded = false;
  let asked = false;
  btn.addEventListener("click", () => {
    expanded = !expanded;
    haptic(HAPTIC.select);
    (fig.querySelector(".cs-s") as SVGGElement).style.opacity = expanded ? "0" : "1";
    (fig.querySelector(".cs-l") as SVGGElement).style.opacity = expanded ? "1" : "0";
    (btn.querySelector("span") as HTMLElement).textContent = expanded ? "줄임말로 보기" : "원래 말로 보기";
    if (expanded && !asked) {
      asked = true;
      btn.classList.remove("pulse");
      face("curious");
      helper.innerHTML = "펼치니 두 배로 길어졌죠? 수학도 이런 <b>줄임말 약속</b>을 써요, 그럼 <b>3×a</b>는 어떻게 줄일까요?";
      window.setTimeout(() => {
        ask(box, helper, {
          choices: choices ?? [
            "3a, 곱셈 기호를 생략하고 수를 앞에",
            "a3, 문자를 앞에",
            "3+a로 바꿔 쓴다",
          ],
          good: "정확해요! 수학의 약속은 <b>×를 생략하고 수를 문자 앞에</b>, 3×a는 <b>3a</b>. 줄임말처럼 짧지만 전 세계 누구나 같은 뜻으로 읽어요.",
          bad: "약속은 <b>수를 문자 앞에, ×는 생략</b>, 3×a는 <b>3a</b>예요. a3이라 쓰면 다른 뜻으로 오해받고, 덧셈 <b>+는 절대 생략 불가</b>(3+a는 3a가 아니에요)! 생략 규칙을 배우러 가요.",
          onDone: finish,
        });
      }, 650);
    }
  });
};

/* ── 3 furniture, 내 몸에 맞는 책상(대입) ───────────────────── */
export const renderFurniture: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  const draw = (h: number): void => {
    const H = h * 0.72;
    const headCy = 178 - H + 11;
    const sy = headCy + 14;
    const hip = 178 - H * 0.42;
    const surf = 178 - (0.4 * h + 2) * 0.72;
    fig.innerHTML = wrapSvg(
      `${SHADOW(110, 183, 36, 0.1)}${SHADOW(251, 183, 62)}
      <line x1="24" y1="178" x2="336" y2="178" stroke="#8CA0B3" stroke-width="2" stroke-linecap="round"/>
      <text x="110" y="${(headCy - 20).toFixed(1)}" text-anchor="middle" font-size="12" font-weight="800" fill="#54677A">${h}cm</text>
      <circle cx="110" cy="${headCy.toFixed(1)}" r="11" fill="#fff" stroke="#3C4654" stroke-width="2.4"/>
      <path d="M105.5 ${(headCy - 2).toFixed(1)} h2.5 M112 ${(headCy - 2).toFixed(1)} h2.5 M106 ${(headCy + 4).toFixed(1)} q4 2.6 8 0" stroke="#3C4654" stroke-width="1.7" fill="none" stroke-linecap="round"/>
      <path d="M110 ${(headCy + 11).toFixed(1)} V${hip.toFixed(1)} M110 ${sy.toFixed(1)} L134 ${(sy + 13).toFixed(1)} M110 ${sy.toFixed(1)} L88 ${(sy + 15).toFixed(1)} M110 ${hip.toFixed(1)} L98 178 M110 ${hip.toFixed(1)} L122 178" stroke="#3C4654" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <rect x="192" y="${surf.toFixed(1)}" width="118" height="9" rx="4" fill="url(#fu-wd)" stroke="#6B4520" stroke-width="1.5"/>
      <line x1="197" y1="${(surf + 2.4).toFixed(1)}" x2="252" y2="${(surf + 2.4).toFixed(1)}" stroke="#fff" stroke-width="1.6" opacity=".4" stroke-linecap="round"/>
      <rect x="200" y="${(surf + 9).toFixed(1)}" width="7" height="${(169 - surf).toFixed(1)}" fill="#A97848" stroke="#7A5226" stroke-width="1.2"/>
      <rect x="295" y="${(surf + 9).toFixed(1)}" width="7" height="${(169 - surf).toFixed(1)}" fill="#A97848" stroke="#7A5226" stroke-width="1.2"/>
      <rect x="220" y="${(surf - 11).toFixed(1)}" width="14" height="11" rx="3" fill="url(#fu-mg)" stroke="#8F1B26" stroke-width="1.2"/>
      <path d="M234 ${(surf - 8).toFixed(1)} q6 1 0 6" stroke="#8F1B26" stroke-width="1.6" fill="none"/>
      <rect x="250" y="${(surf - 8).toFixed(1)}" width="32" height="8" rx="2" fill="url(#fu-bk)" stroke="#2E6494" stroke-width="1.2"/>
      <line x1="253" y1="${(surf - 4).toFixed(1)}" x2="279" y2="${(surf - 4).toFixed(1)}" stroke="#fff" opacity=".5" stroke-width="1.2"/>
      <line x1="322" y1="178" x2="322" y2="${surf.toFixed(1)}" stroke="#0A87A3" stroke-width="1.8"/>
      <path d="M322 ${surf.toFixed(1)} l-4 7 M322 ${surf.toFixed(1)} l4 7 M322 178 l-4 -7 M322 178 l4 -7" stroke="#0A87A3" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      <line x1="314" y1="${surf.toFixed(1)}" x2="330" y2="${surf.toFixed(1)}" stroke="#0A87A3" stroke-width="1.4"/>
      <text x="322" y="${(surf - 10).toFixed(1)}" text-anchor="middle" font-size="13" font-weight="900" fill="#0A87A3">${(0.4 * h + 2).toFixed(0)}<tspan font-size="9" font-weight="700"> cm</tspan></text>`,
      `<linearGradient id="fu-wd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E8BE86"/><stop offset=".55" stop-color="#C08A4E"/><stop offset="1" stop-color="#8F6132"/></linearGradient>
      <linearGradient id="fu-mg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF9AA2"/><stop offset="1" stop-color="#E8434F"/></linearGradient>
      <linearGradient id="fu-bk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8CC4F0"/><stop offset="1" stop-color="#4A8CC4"/></linearGradient>`,
    );
  };
  draw(160);
  const HS = [150, 160, 170];
  const row = el("div", { style: "display:flex; gap:8px; margin-top:12px" });
  const btns = HS.map((h) =>
    el("button", { class: "swapbtn pulse", style: "margin-top:0; flex:1", attrs: { type: "button", "aria-pressed": "false" } }, el("span", { text: `${h}cm` })),
  );
  const setActive = (h: number): void => {
    HS.forEach((v, i) => {
      const on = v === h;
      btns[i].style.borderColor = on ? "#0DA5C6" : "";
      btns[i].style.background = on ? "#E6F7FB" : "";
      btns[i].style.color = on ? "#0A87A3" : "";
      btns[i].setAttribute("aria-pressed", on ? "true" : "false");
    });
  };
  setActive(160);
  row.append(...btns);
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, row, box);
  helper.innerHTML = "몸에 딱 맞는 책상 높이는 <b>키의 0.4배에 2를 더한 값</b>이래요. 지금은 키 160cm 기준, 버튼으로 키를 바꿔 보세요.";
  const tried = new Set<number>();
  let taps = 0;
  let asked = false;
  HS.forEach((h, i) => {
    btns[i].addEventListener("click", () => {
      haptic(HAPTIC.select);
      draw(h);
      setActive(h);
      tried.add(h);
      taps += 1;
      if (!asked && (tried.size >= 2 || taps >= 3)) {
        asked = true;
        btns.forEach((b) => b.classList.remove("pulse"));
        face("curious");
        window.setTimeout(() => {
          helper.innerHTML = "키가 바뀌면 책상 높이도 따라 바뀌어요. 가구 회사엔 <b>세상 모든 키</b>에 맞는 높이표가 있는 셈인데, 비밀이 뭘까요?";
          window.setTimeout(() => {
            ask(box, helper, {
              choices: choices ?? [
                "키를 x로 둔 식 0.4x+2, 누구든 대입만 하면 끝",
                "키별로 표를 전부 만들어 둔다",
                "평균 키 하나로 통일한다",
              ],
              good: "그렇죠! 키를 <b>x</b>로 두면 식은 <b>0.4x+2</b> 하나뿐, 150이든 163이든 값을 <b>대입</b>만 하면 즉시 나와요. 식 하나+대입, 그게 맞춤의 비밀이에요.",
              bad: "1cm 단위로 표를 다 만들면 수백 줄이고, 평균 키 하나로는 몸에 안 맞아요. 비밀은 키를 x로 둔 식 <b>0.4x+2</b>, 누구든 자기 키를 <b>대입</b>하면 끝이에요. 문자에 수를 넣는 대입을 배워요.",
              onDone: finish,
            });
          }, 700);
        }, 400);
      }
    });
  });
};

/* ── 4 macaron, 쿠키 봉투의 비밀(항·상수항) ─────────────────── */
export const renderMacaron: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  const POS: [number, number][] = [[152, 92], [180, 92], [208, 92], [166, 99], [194, 99]];
  const cookie = (i: number): string => {
    const [x, y] = POS[i];
    return `<g class="mc-m${i}" style="opacity:0; transform: translate(${x}px, ${y - 22}px) scale(.7); transition: transform .5s cubic-bezier(.34,1.35,.5,1), opacity .3s">
      <circle cx="0" cy="0" r="10.5" fill="url(#mc-ck)" stroke="#7E5226" stroke-width="1.3"/>
      <circle cx="-4" cy="-2" r="1.7" fill="#5E3A1C"/><circle cx="3" cy="-4" r="1.4" fill="#5E3A1C"/>
      <circle cx="4.5" cy="2.5" r="1.5" fill="#5E3A1C"/><circle cx="-1.5" cy="4" r="1.2" fill="#5E3A1C"/>
      <ellipse cx="-3.5" cy="-4.5" rx="3.6" ry="1.8" fill="#fff" opacity=".4"/>
    </g>`;
  };
  fig.innerHTML = wrapSvg(
    `${SHADOW(180, 183, 86)}
    <rect x="134" y="86" width="92" height="18" rx="4" fill="#9C6E46" stroke="#7E5226" stroke-width="1.2"/>
    ${[0, 1, 2, 3, 4].map(cookie).join("")}
    <rect x="132" y="100" width="96" height="30" rx="5" fill="url(#mc-bx)" stroke="#9C6242" stroke-width="1.5"/>
    <rect x="132" y="100" width="96" height="6.5" rx="3" fill="#C98A64" stroke="#9C6242" stroke-width=".9"/>
    <ellipse cx="150" cy="110" rx="10" ry="3" fill="#fff" opacity=".3"/>
    <rect x="118" y="128" width="124" height="8" rx="4" fill="url(#mc-pl)" stroke="#7E8C9C" stroke-width="1.3"/>
    <rect x="172" y="136" width="16" height="9" fill="#8C99A8" stroke="#5E6C7C" stroke-width="1.2"/>
    <rect x="96" y="144" width="168" height="34" rx="13" fill="url(#mc-mt)" stroke="#6E7C8C" stroke-width="1.6"/>
    <ellipse cx="114" cy="150" rx="10" ry="3.5" fill="#fff" opacity=".4"/>
    <rect x="192" y="152" width="60" height="19" rx="5" fill="#1E2A38"/>
    <text class="mc-disp" x="222" y="166" text-anchor="middle" font-size="12" font-weight="900" fill="#7FE0D2">8</text>`,
    `<linearGradient id="mc-bx" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F6D7C4"/><stop offset=".55" stop-color="#E8B08E"/><stop offset="1" stop-color="#C98A64"/></linearGradient>
    <linearGradient id="mc-pl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2F6FA"/><stop offset="1" stop-color="#C2CEDA"/></linearGradient>
    <linearGradient id="mc-mt" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F2F6FA"/><stop offset=".5" stop-color="#D8E2EC"/><stop offset="1" stop-color="#AEBCCA"/></linearGradient>
    <radialGradient id="mc-ck" cx=".38" cy=".32" r=".95"><stop offset="0" stop-color="#F2CE96"/><stop offset=".55" stop-color="#D9A25E"/><stop offset="1" stop-color="#A87038"/></radialGradient>`,
  );
  const read = el("div", { class: "pw-read" });
  const gUnit = `<span style="font-size:15px;font-weight:800;color:#8CA0B3"> g</span>`;
  read.innerHTML = mfmt("8") + gUnit;
  const btn = mkBtn("쿠키 추가");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, read, btn, box);
  helper.innerHTML = "저울 위 봉투만 달면 <b>8g</b>. 쿠키 1개 무게는 아직 모르니 <b>x g</b>이라 부를게요. 하나씩 담아 봐요.";
  let n = 0;
  btn.addEventListener("click", () => {
    if (n >= 5) return;
    n += 1;
    haptic(HAPTIC.select);
    const m = fig.querySelector(`.mc-m${n - 1}`) as SVGGElement;
    m.style.opacity = "1";
    m.style.transform = `translate(${POS[n - 1][0]}px, ${POS[n - 1][1]}px) scale(1)`;
    const expr = `${n === 1 ? "" : n}x+8`;
    read.innerHTML = mfmt(expr) + gUnit;
    (fig.querySelector(".mc-disp") as SVGTextElement).textContent = expr;
    if (n === 5) {
      btn.disabled = true;
      btn.classList.remove("pulse");
      window.setTimeout(() => {
        face("curious");
        helper.innerHTML = "쿠키가 늘 때마다 <b>x가 하나씩</b> 붙었어요. 그런데 뒤의 <b>8</b>은 5개를 담는 내내 꿈쩍도 안 했죠, 정체가 뭘까요?";
        window.setTimeout(() => {
          ask(box, helper, {
            choices: choices ?? [
              "봉투 무게, 개수와 상관없이 늘 그대로(상수)",
              "쿠키와 함께 늘어난다",
              "5개가 넘으면 사라진다",
            ],
            good: "정확해요! 8은 <b>봉투 무게</b>, 개수와 상관없이 늘 그대로인 <b>상수항</b>이에요. 5x처럼 변하는 항과 8처럼 변하지 않는 항, 식은 이 두 부품으로 조립돼요.",
            bad: "늘어난 건 쿠키 몫인 <b>5x</b>뿐, 8은 <b>봉투 무게</b>라 1개를 담든 5개를 담든 그대로예요. 변하는 항(5x)과 변하지 않는 상수항(8), 식의 두 부품을 해부하러 가요.",
            onDone: finish,
          });
        }, 750);
      }, 600);
    }
  });
};

/* ── 5 basket, 뒤섞인 장바구니(동류항) ──────────────────────── */
export const renderBasket: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  const apple = (i: number, x: number, y: number): string =>
    `<g class="bk-a${i}" style="transform: translate(${x}px, ${y}px); transition: transform .55s cubic-bezier(.5,.1,.4,1)">
      <circle cx="0" cy="0" r="13" fill="url(#bk-ap)" stroke="#8F1B26" stroke-width="1.4"/>
      <ellipse cx="-4.5" cy="-5" rx="4" ry="2.4" fill="#fff" opacity=".45"/>
      <path d="M0 -13 Q1 -18 3 -20" stroke="#6B4520" stroke-width="2" stroke-linecap="round"/>
      <path d="M3 -19 q7 -4 9 2 q-6 4 -9 -2 z" fill="#4BAA58" stroke="#2E7C3A" stroke-width="1"/>
    </g>`;
  const banana = (i: number, x: number, y: number): string =>
    `<g class="bk-b${i}" style="transform: translate(${x}px, ${y}px); transition: transform .55s cubic-bezier(.5,.1,.4,1)">
      <path d="M-17 0 Q-13 12 2 14 Q14 14 19 4 Q20 0 16.5 .5 Q12 8 2 8.5 Q-8 8 -12.5 -2 Z" fill="url(#bk-bn)" stroke="#A5760E" stroke-width="1.3"/>
      <path d="M-16.5 -1 l-2.5 -2.5" stroke="#6B4520" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M-9 5 Q0 10 10 7" stroke="#fff" stroke-width="1.6" opacity=".45" fill="none" stroke-linecap="round"/>
    </g>`;
  fig.innerHTML = wrapSvg(
    `${SHADOW(180, 184, 78, 0.12)}
    <path d="M122 100 Q180 30 238 100" stroke="#A87844" stroke-width="7" stroke-linecap="round"/>
    <path d="M126 96 Q180 36 234 96" stroke="#D8B486" stroke-width="2.2" stroke-linecap="round" opacity=".7"/>
    <path d="M116 102 L128 164 Q180 174 232 164 L244 102 Q180 116 116 102 Z" fill="url(#bk-w)" stroke="#7A5226" stroke-width="1.6"/>
    <path d="M122 124 Q180 134 238 124 M127 146 Q180 155 233 146" stroke="#7A5226" stroke-width="1.4" opacity=".35" fill="none"/>
    <ellipse cx="147" cy="118" rx="7" ry="2.6" fill="#fff" opacity=".28"/>
    <g class="bk-zn" style="opacity:0; transition: opacity .5s">
      <rect x="66" y="30" width="92" height="74" rx="14" fill="#FFF2F3" fill-opacity=".55" stroke="#F0525E" stroke-width="1.6" stroke-dasharray="6 5"/>
      <circle cx="66" cy="30" r="11" fill="#F0525E"/><text x="66" y="34.5" text-anchor="middle" font-size="12.5" font-weight="900" fill="#fff">3</text>
      <rect x="204" y="30" width="92" height="74" rx="14" fill="#FFFBEA" fill-opacity=".65" stroke="#D8A21E" stroke-width="1.6" stroke-dasharray="6 5"/>
      <circle cx="204" cy="30" r="11" fill="#D8A21E"/><text x="204" y="34.5" text-anchor="middle" font-size="12.5" font-weight="900" fill="#fff">2</text>
    </g>
    ${apple(0, 152, 80)}${apple(1, 206, 74)}${apple(2, 178, 88)}
    ${banana(0, 132, 86)}${banana(1, 226, 84)}
    <ellipse cx="180" cy="102" rx="64" ry="13" fill="none" stroke="#7A5226" stroke-width="1.6"/>`,
    `<linearGradient id="bk-w" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E8C48E"/><stop offset=".5" stop-color="#C89A5E"/><stop offset="1" stop-color="#9C6E3A"/></linearGradient>
    <radialGradient id="bk-ap" cx=".35" cy=".3" r=".95"><stop offset="0" stop-color="#FF9AA2"/><stop offset=".55" stop-color="#F0525E"/><stop offset="1" stop-color="#C42834"/></radialGradient>
    <linearGradient id="bk-bn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE89A"/><stop offset=".55" stop-color="#F5C93D"/><stop offset="1" stop-color="#D8A21E"/></linearGradient>`,
  );
  const btn = mkBtn("합쳐 보기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "장바구니에 <b>사과 3개</b>와 <b>바나나 2개</b>가 뒤섞여 있어요. 전부 합치면 몇 개…? 일단 합쳐 볼게요.";
  const g = (sel: string): SVGGElement => fig.querySelector(sel) as SVGGElement;
  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    // 1악장: 가운데로 와글와글
    const clusterA: [number, number][] = [[168, 62], [192, 64], [180, 80]];
    const clusterB: [number, number][] = [[162, 76], [198, 74]];
    clusterA.forEach(([x, y], i) => (g(`.bk-a${i}`).style.transform = `translate(${x}px, ${y}px)`));
    clusterB.forEach(([x, y], i) => (g(`.bk-b${i}`).style.transform = `translate(${x}px, ${y}px)`));
    // 2악장: 종류별로 튕겨 정렬
    window.setTimeout(() => {
      haptic(HAPTIC.tap);
      const spring = "transform .7s cubic-bezier(.34,1.35,.5,1)";
      const zoneA: [number, number][] = [[96, 56], [132, 56], [114, 86]];
      const zoneB: [number, number][] = [[234, 54], [266, 84]];
      zoneA.forEach(([x, y], i) => {
        const a = g(`.bk-a${i}`);
        a.style.transition = spring;
        a.style.transform = `translate(${x}px, ${y}px)`;
      });
      zoneB.forEach(([x, y], i) => {
        const b = g(`.bk-b${i}`);
        b.style.transition = spring;
        b.style.transform = `translate(${x}px, ${y}px)`;
      });
      g(".bk-zn").style.opacity = "1";
    }, 650);
    window.setTimeout(() => {
      face("curious");
      helper.innerHTML = "합치려 해도 튕겨 나와요, 사과는 사과끼리 <b>3</b>, 바나나는 바나나끼리 <b>2</b>. 사과 3개+바나나 2개=<b>5개</b>라고 해도 될까요? 뭔가 이상하죠.";
      window.setTimeout(() => {
        ask(box, helper, {
          choices: choices ?? [
            "같은 종류끼리만 더할 수 있다, 3x+2y는 그대로",
            "과일이니까 5개로 합쳐도 된다",
            "바나나를 사과로 바꿔 계산한다",
          ],
          good: "맞아요! <b>문자가 같아야 한 무리(동류항)</b>, 사과끼리 3x, 바나나끼리 2y까지만 합쳐지고, 다르면 나란히 둘 뿐이에요. 3x+2y는 이미 완성형!",
          bad: "'5개'라고 합치는 순간 사과인지 바나나인지 <b>정보가 사라져요</b>(바나나를 사과로 바꿀 수도 없고요). 더하기는 <b>같은 종류끼리만</b>, 3x+2y는 그대로 두는 게 답이에요. 동류항 가리는 눈을 길러요.",
          onDone: finish,
        });
      }, 650);
    }, 1500);
  });
};

/* ── 6 catfood, 얼룩진 영수증(등식·방정식) ──────────────────── */
export const renderCatfood: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  let bars = "";
  let bxx = 138;
  for (const w of [2.5, 1.5, 3, 1.5, 2.5, 1.5, 3, 2, 1.5, 3, 1.5, 2.5, 1.5, 3, 2, 1.5, 2.5]) {
    bars += `<rect x="${bxx}" y="140" width="${w}" height="16" fill="#39424E"/>`;
    bxx += w + 2.6;
  }
  let zig = "";
  for (let i = 0; i < 8; i++) zig += "l-9.5 9 l-9.5 -9 ";
  fig.innerHTML = wrapSvg(
    `${SHADOW(180, 186, 74, 0.1)}${SHADOW(300, 182, 24, 0.1)}
    <path class="cf-tail" d="M312 168 Q332 162 328 142" stroke="#333F4E" stroke-width="5" stroke-linecap="round"/>
    <path d="M291 114 l-4 -11 l10 5 z M311 114 l4 -11 l-10 5 z" fill="url(#cf-ct)" stroke="#1E2A38" stroke-width="1.3"/>
    <path d="M288 176 Q284 142 301 131 Q317 139 313 176 Z" fill="url(#cf-ct)" stroke="#1E2A38" stroke-width="1.5"/>
    <circle cx="301" cy="121" r="13" fill="url(#cf-ct)" stroke="#1E2A38" stroke-width="1.5"/>
    <circle cx="296.5" cy="120" r="1.6" fill="#FFD98A"/><circle cx="305.5" cy="120" r="1.6" fill="#FFD98A"/>
    <ellipse cx="296" cy="114" rx="4" ry="1.8" fill="#fff" opacity=".25"/>
    <g transform="rotate(-1.5 180 95)">
      <path d="M104 16 L256 16 L256 164 ${zig}Z" fill="url(#cf-pp)" stroke="#C9C2AC" stroke-width="1.4"/>
      <ellipse cx="126" cy="22" rx="12" ry="3" fill="#fff" opacity=".65"/>
      <ellipse cx="228" cy="27" rx="4" ry="3" fill="#E8968C" opacity=".9"/>
      <circle cx="223.5" cy="23.5" r="1.6" fill="#E8968C" opacity=".9"/><circle cx="228" cy="22.2" r="1.6" fill="#E8968C" opacity=".9"/><circle cx="232.5" cy="23.5" r="1.6" fill="#E8968C" opacity=".9"/>
      <line x1="118" y1="38" x2="242" y2="38" stroke="#C9C2AC" stroke-width="1.6" stroke-dasharray="5 4"/>
      <text x="120" y="66" font-size="12.5" font-weight="700" fill="#54677A">사료</text>
      <text x="240" y="66" text-anchor="end" font-size="14" font-weight="900" fill="#1E2A38">9000</text>
      <text x="120" y="92" font-size="12.5" font-weight="700" fill="#54677A">간식</text>
      <text x="190" y="92" text-anchor="end" font-size="14" font-weight="900" fill="#1E2A38">3 ×</text>
      <ellipse cx="216" cy="86" rx="21" ry="9" fill="url(#cf-sm)" opacity=".92"/>
      <ellipse cx="206" cy="82" rx="11" ry="7" fill="url(#cf-sm)" opacity=".85"/>
      <ellipse cx="228" cy="90" rx="11" ry="6" fill="url(#cf-sm)" opacity=".85"/>
      <line x1="118" y1="106" x2="242" y2="106" stroke="#C9C2AC" stroke-width="1.6" stroke-dasharray="5 4"/>
      <text x="120" y="130" font-size="13" font-weight="800" fill="#54677A">합계</text>
      <text x="240" y="130" text-anchor="end" font-size="15" font-weight="900" fill="#0A87A3">13500</text>
      ${bars}
    </g>
    <g class="cf-mg" style="opacity:0; transform: scale(.5); transform-origin: 214px 84px; transition: transform .55s cubic-bezier(.34,1.35,.5,1), opacity .35s">
      <line x1="233" y1="103" x2="254" y2="126" stroke="#39424E" stroke-width="7" stroke-linecap="round"/>
      <circle cx="214" cy="84" r="27" fill="#F2FAFF" opacity=".94" stroke="#39424E" stroke-width="3.5"/>
      <circle cx="214" cy="84" r="22" fill="none" stroke="#8CC4E8" stroke-width="1.5" opacity=".8"/>
      <path d="M199 72 q6 -8 16 -9" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>
      <text x="214" y="93" text-anchor="middle" font-size="26" font-weight="900" fill="#E8434F">?<animate attributeName="opacity" values="1;.35;1" dur="1.1s" repeatCount="indefinite"/></text>
    </g>`,
    `<linearGradient id="cf-pp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".55" stop-color="#F8F5EC"/><stop offset="1" stop-color="#EAE4D2"/></linearGradient>
    <linearGradient id="cf-sm" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#C4A06A"/><stop offset=".55" stop-color="#9C7A46"/><stop offset="1" stop-color="#6E5430"/></linearGradient>
    <linearGradient id="cf-ct" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8FA0B4"/><stop offset=".5" stop-color="#54677A"/><stop offset="1" stop-color="#333F4E"/></linearGradient>`,
  );
  const btn = mkBtn("얼룩 확대");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "고양이 간식을 사 온 영수증, 사료 9000원, 간식 <b>3개</b>, 합계 13500원. 그런데 간식 <b>1개 값</b> 위에 얼룩이 앉았어요!";
  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    const mg = fig.querySelector(".cf-mg") as SVGGElement;
    mg.style.opacity = "1";
    mg.style.transform = "scale(1)";
    face("curious");
    window.setTimeout(() => {
      helper.innerHTML = "돋보기로 들여다봐도 물음표… 그래도 이 값, <b>알아낼 방법</b>이 있을까요?";
      window.setTimeout(() => {
        ask(box, helper, {
          choices: choices ?? [
            "9000+3×▢=13500이라는 등식에서 거꾸로 알아낼 수 있다",
            "가게에 전화해 봐야만 안다",
            "알 방법이 없다",
          ],
          good: "명탐정이에요! 모르는 값을 x로 두면 <b>9000+3×x=13500</b>, 이런 등식을 <b>방정식</b>이라 불러요. 풀면 x=1500, 간식은 1개 1500원이었네요!",
          bad: "전화 없이도 단서는 영수증 안에 다 있어요, 얼룩 값을 x로 두면 <b>9000+3×x=13500</b>이라는 등식이 되죠. 이걸 <b>방정식</b>이라 부르고, 풀면 1500원! 모르는 수를 알아내는 기술을 배워요.",
          onDone: finish,
        });
      }, 700);
    }, 700);
  });
};

/* ── 7 justice, 정의의 여신(등식의 성질) ────────────────────── */
export const renderJustice: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  fig.innerHTML = wrapSvg(
    `${SHADOW(180, 186, 74, 0.12)}
    <rect x="118" y="170" width="124" height="12" rx="4" fill="url(#js-st2)" stroke="#5E6C7C" stroke-width="1.4"/>
    <rect x="140" y="146" width="80" height="26" rx="5" fill="url(#js-st)" stroke="#5E6C7C" stroke-width="1.5"/>
    <ellipse cx="154" cy="151" rx="9" ry="2.6" fill="#fff" opacity=".45"/>
    <g class="js-stat" style="transition: transform .45s cubic-bezier(.34,1.35,.5,1); transform-origin: 180px 170px">
      <path d="M180 64 Q162 96 156 146 L204 146 Q198 96 180 64 Z" fill="url(#js-rb)" stroke="#5E7890" stroke-width="1.5"/>
      <path d="M172 96 Q170 120 168 144 M188 96 Q190 120 192 144" stroke="#5E7890" stroke-width="1.2" opacity=".35" fill="none"/>
      <ellipse cx="172" cy="84" rx="5" ry="9" fill="#fff" opacity=".25"/>
      <path d="M174 76 Q158 72 146 62" stroke="#3C4654" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <path d="M186 76 Q202 84 206 100" stroke="#3C4654" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <line x1="206" y1="100" x2="210" y2="124" stroke="#8C99A8" stroke-width="3.5" stroke-linecap="round"/>
      <line x1="201" y1="104" x2="212" y2="99" stroke="#C9A227" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="180" cy="50" r="12" fill="#fff" stroke="#3C4654" stroke-width="2.4"/>
      <rect x="167" y="45" width="26" height="7" rx="3.5" fill="#54677A"/>
      <path d="M193 48 l8 3" stroke="#54677A" stroke-width="3" stroke-linecap="round"/>
      <path d="M176 58 q4 2.6 8 0" stroke="#3C4654" stroke-width="1.7" fill="none" stroke-linecap="round"/>
      <g class="js-sc" style="transition: transform .8s cubic-bezier(.34,1.35,.5,1); transform-origin: 146px 62px">
        <line x1="146" y1="62" x2="146" y2="76" stroke="#8A7020" stroke-width="2"/>
        <line x1="100" y1="76" x2="192" y2="76" stroke="#C9A227" stroke-width="4.5" stroke-linecap="round"/>
        <line x1="103" y1="74.4" x2="189" y2="74.4" stroke="#F5DC7E" stroke-width="1.4" stroke-linecap="round" opacity=".7"/>
        <circle cx="146" cy="76" r="3.5" fill="#8A7020"/>
        <path d="M100 76 L92 98 M100 76 L108 98 M192 76 L184 98 M192 76 L200 98" stroke="#8A7020" stroke-width="1.6"/>
        <path d="M86 98 Q100 112 114 98 Z" fill="url(#js-gd)" stroke="#7E650A" stroke-width="1.4"/>
        <path d="M178 98 Q192 112 206 98 Z" fill="url(#js-gd)" stroke="#7E650A" stroke-width="1.4"/>
        <g class="js-w" style="opacity:0; transform: translateY(-30px); transition: transform .35s cubic-bezier(.5,0,.7,.4), opacity .25s">
          <path d="M95 88 Q100 80 105 88" stroke="#232D3A" stroke-width="2.5" fill="none"/>
          <circle cx="100" cy="94" r="8.5" fill="url(#js-ir)" stroke="#232D3A" stroke-width="1.4"/>
          <ellipse cx="97" cy="91" rx="2.6" ry="1.6" fill="#fff" opacity=".35"/>
        </g>
      </g>
    </g>`,
    `<linearGradient id="js-st" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F2F6FA"/><stop offset=".5" stop-color="#C9D4E0"/><stop offset="1" stop-color="#9AAAB9"/></linearGradient>
    <linearGradient id="js-st2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D8E2EC"/><stop offset="1" stop-color="#A5B4C4"/></linearGradient>
    <linearGradient id="js-rb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F4F8FC"/><stop offset=".5" stop-color="#D2E0EC"/><stop offset="1" stop-color="#A8BCCE"/></linearGradient>
    <linearGradient id="js-gd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F8E49A"/><stop offset=".5" stop-color="#D9B23A"/><stop offset="1" stop-color="#A5820E"/></linearGradient>
    <radialGradient id="js-ir" cx=".35" cy=".3" r=".95"><stop offset="0" stop-color="#B9C6D4"/><stop offset=".55" stop-color="#54677A"/><stop offset="1" stop-color="#2E3A48"/></radialGradient>`,
  );
  const btn = mkBtn("왼쪽에만 추 올리기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "법원 앞 <b>정의의 여신상</b>이에요. 눈을 가리고 손에는 양팔저울, 지금은 완벽한 균형이죠. 살짝 건드려 볼까요?";
  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    const w = fig.querySelector(".js-w") as SVGGElement;
    w.style.opacity = "1";
    w.style.transform = "translateY(0)";
    const sc = fig.querySelector(".js-sc") as SVGGElement;
    const stat = fig.querySelector(".js-stat") as SVGGElement;
    window.setTimeout(() => {
      haptic(HAPTIC.wrong);
      face("surprised");
      sc.style.transform = "rotate(-11deg)";
      stat.style.transform = "rotate(2.6deg)";
    }, 380);
    window.setTimeout(() => (stat.style.transform = "rotate(-1.4deg)"), 900);
    window.setTimeout(() => (stat.style.transform = "rotate(0deg)"), 1350);
    window.setTimeout(() => {
      helper.innerHTML = "한쪽에만 올렸더니 <b>균형이 와르르</b>. 여신상이 하필 저울을 든 이유가 뭘까요?";
      window.setTimeout(() => {
        ask(box, helper, {
          choices: choices ?? [
            "양쪽을 똑같이 다뤄야 균형이 유지되니까, 공정의 상징",
            "무게 재는 일이 많아서",
            "장식일 뿐 의미 없다",
          ],
          good: "맞아요, 저울은 <b>양쪽을 똑같이</b> 대할 때만 수평이라 공정의 상징이 됐어요. 등식도 저울이에요: <b>양변에 같은 일</b>을 해야 =가 유지되죠. 다음 랩에서 직접 확인해요!",
          bad: "무게 재기용도, 장식도 아니에요, 저울은 <b>양쪽을 똑같이 다뤄야 균형</b>이 유지되는 물건이라 공정의 상징이 됐죠. 등식도 똑같아요: 양변에 같은 일을 하면 =가 그대로! 저울 랩에서 직접 만져 봐요.",
          onDone: finish,
        });
      }, 750);
    }, 1000);
  });
};

/* ── 8 leap, 강 건너는 항(이항 예고) ────────────────────────── */
export const renderLeap: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  const chip = (x: number, gradId: string, outline: string, label: string, italic = false): string =>
    `<g transform="translate(${x},100)">
      <rect x="-21" y="-20" width="42" height="40" rx="12" fill="url(#${gradId})" stroke="${outline}" stroke-width="1.5"/>
      <ellipse cx="-7" cy="-12" rx="8" ry="3.5" fill="#fff" opacity=".35"/>
      <text x="0" y="6" text-anchor="middle" font-size="17" font-weight="900" fill="#fff"${italic ? ` font-style="italic"` : ""}>${label}</text>
    </g>`;
  fig.innerHTML = wrapSvg(
    `${SHADOW(180, 184, 104, 0.1)}
    <rect x="22" y="18" width="316" height="154" rx="16" fill="url(#lp-cd)" stroke="#C2CEDC" stroke-width="1.5"/>
    <path d="M164 18 Q156 58 168 96 Q178 128 162 172 L198 172 Q184 128 194 96 Q206 58 196 18 Z" fill="url(#lp-rv)" opacity=".95"/>
    <path d="M170 60 q6 4 12 0 M168 104 q6 4 12 0 M172 142 q6 4 12 0" stroke="#fff" stroke-width="1.8" stroke-linecap="round" opacity=".55" fill="none"/>
    <rect x="168" y="88" width="24" height="5.5" rx="2.75" fill="#fff" stroke="#4A9CD4" stroke-width=".8"/>
    <rect x="168" y="98.5" width="24" height="5.5" rx="2.75" fill="#fff" stroke="#4A9CD4" stroke-width=".8"/>
    <rect x="36" y="120" width="118" height="8" rx="4" fill="url(#lp-gs)" stroke="#4E8C3E" stroke-width="1.2"/>
    <rect x="208" y="120" width="116" height="8" rx="4" fill="url(#lp-gs)" stroke="#4E8C3E" stroke-width="1.2"/>
    <text class="lp-eq" x="180" y="44" text-anchor="middle" font-size="16" font-weight="900" fill="#1E2A38"><tspan font-style="italic">x</tspan> − 5 = 13</text>
    ${chip(78, "lp-x", "#086E86", "x", true)}
    ${chip(248, "lp-num", "#4E3AC4", "13")}
    <g class="lp-jx" style="transform: translate(128px,100px); transition: transform .95s linear">
      <g class="lp-jy" style="transform-box: fill-box; transform-origin: center; transition: transform .48s cubic-bezier(.25,.6,.45,1)">
        <g class="lp-spin" style="transform-box: fill-box; transform-origin: center; transition: transform .95s linear">
          <rect class="lp-jr" x="-21" y="-20" width="42" height="40" rx="12" fill="url(#lp-neg)" stroke="#8F1B26" stroke-width="1.5"/>
          <ellipse cx="-7" cy="-12" rx="8" ry="3.5" fill="#fff" opacity=".35"/>
          <text class="lp-jt" x="0" y="6" text-anchor="middle" font-size="17" font-weight="900" fill="#fff">−5</text>
        </g>
      </g>
    </g>
    <g class="lp-fx" style="opacity:0; transform: scale(.4); transform-origin: 296px 100px; transition: transform .35s cubic-bezier(.34,1.6,.5,1), opacity .3s">
      ${star(296, 100, 34, 14, "#FFD98A", "#E8A21E")}
    </g>`,
    `<linearGradient id="lp-cd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".5" stop-color="#F2F6FB"/><stop offset="1" stop-color="#E2EAF4"/></linearGradient>
    <linearGradient id="lp-rv" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#BFE4F8"/><stop offset=".5" stop-color="#7FC4EC"/><stop offset="1" stop-color="#4A9CD4"/></linearGradient>
    <linearGradient id="lp-gs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A8DC8C"/><stop offset="1" stop-color="#6FB85C"/></linearGradient>
    <linearGradient id="lp-x" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#52CCE4"/><stop offset=".55" stop-color="#0DA5C6"/><stop offset="1" stop-color="#0A87A3"/></linearGradient>
    <linearGradient id="lp-num" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9C8CFF"/><stop offset=".55" stop-color="#7C6BFF"/><stop offset="1" stop-color="#6A55F2"/></linearGradient>
    <linearGradient id="lp-neg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF9AA2"/><stop offset=".55" stop-color="#F0525E"/><stop offset="1" stop-color="#C42834"/></linearGradient>
    <linearGradient id="lp-pos" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8FE8C4"/><stop offset=".55" stop-color="#26B87E"/><stop offset="1" stop-color="#148C5E"/></linearGradient>`,
  );
  const btn = mkBtn("−5를 건너 보내기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "등식 <b>x−5=13</b>, 등호가 <b>강</b>처럼 양쪽 기슭을 가르고 있어요. 왼쪽 기슭의 −5를 강 건너로 보내 볼게요.";
  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    const jx = fig.querySelector(".lp-jx") as SVGGElement;
    const jy = fig.querySelector(".lp-jy") as SVGGElement;
    const spin = fig.querySelector(".lp-spin") as SVGGElement;
    jx.style.transform = "translate(296px,100px)";
    spin.style.transform = "rotate(360deg)";
    jy.style.transform = "translateY(-58px)";
    window.setTimeout(() => {
      jy.style.transition = "transform .47s cubic-bezier(.55,0,.75,.4)";
      jy.style.transform = "translateY(0)";
    }, 480);
    window.setTimeout(() => {
      haptic(HAPTIC.correct);
      face("surprised");
      (fig.querySelector(".lp-jt") as SVGTextElement).textContent = "+5";
      const jr = fig.querySelector(".lp-jr") as SVGRectElement;
      jr.setAttribute("fill", "url(#lp-pos)");
      jr.setAttribute("stroke", "#0B6E46");
      (fig.querySelector(".lp-eq") as SVGTextElement).innerHTML = `<tspan font-style="italic">x</tspan> = 13 + 5`;
      const fx = fig.querySelector(".lp-fx") as SVGGElement;
      fx.style.opacity = "1";
      fx.style.transform = "scale(1.1)";
      jy.style.transition = "transform .3s cubic-bezier(.34,1.6,.5,1)";
      jy.style.transform = "scale(1.16)";
    }, 960);
    window.setTimeout(() => ((fig.querySelector(".lp-jy") as SVGGElement).style.transform = "scale(1)"), 1200);
    window.setTimeout(() => {
      const fx = fig.querySelector(".lp-fx") as SVGGElement;
      fx.style.opacity = "0";
    }, 1550);
    window.setTimeout(() => {
      helper.innerHTML = "건너는 순간 <b>−5가 +5로</b> 변신했어요! 항이 등호를 건너면 무슨 일이 일어난 걸까요?";
      window.setTimeout(() => {
        ask(box, helper, {
          choices: choices ?? [
            "부호가 반대로 바뀐다, 양변에 5를 더한 것과 같은 일",
            "그대로 넘어간다",
            "등호가 부등호로 바뀐다",
          ],
          good: "예리해요! 순간이동처럼 보이지만 정체는 <b>등식의 성질</b>, 양변에 똑같이 5를 더한 것과 같은 일이라, 건너간 항은 부호가 뒤집혀요. 이 기술의 이름은 <b>이항</b>!",
          bad: "방금 봤죠, −5는 <b>+5로 변신</b>해서 건넜어요. 그대로 넘어가면 등식이 깨지고, 등호는 그대로 등호예요. 정체는 '양변에 5 더하기'(등식의 성질), 부호가 뒤집히는 이 기술, <b>이항</b>을 배워요.",
          onDone: finish,
        });
      }, 700);
    }, 1250);
  });
};

/* ── 9 horse, 구일집의 추격전(방정식 활용) ──────────────────── */
export const renderHorse: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  const horse = (cls: string, grad: string, outline: string, x: number, y: number): string =>
    `<g class="${cls}" style="transform: translate(${x}px, ${y}px); transition: transform 2.4s linear">
      <g>
        <animateTransform attributeName="transform" type="translate" values="0 0; 0 -2; 0 0" dur="0.5s" repeatCount="indefinite"/>
        <ellipse cx="0" cy="20.5" rx="21" ry="3.2" fill="#2A3A5E" opacity=".1"/>
        <path d="M-19 -3 Q-28 1 -25 11" stroke="${outline}" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M-13 6 L-16 19 M-7 8 L-6 19 M7 8 L6 19 M13 6 L16 19" stroke="${outline}" stroke-width="2.7" stroke-linecap="round"/>
        <ellipse cx="0" cy="0" rx="20" ry="10.5" fill="url(#${grad})" stroke="${outline}" stroke-width="1.5"/>
        <path d="M9 -6 Q14 -13 21 -17 L27 -11 Q20 -7 15 0 Z" fill="url(#${grad})" stroke="${outline}" stroke-width="1.4"/>
        <path d="M21 -17 Q27 -22 32 -19 Q35 -17 34 -13 Q33 -10 28 -10 L24 -11 Z" fill="url(#${grad})" stroke="${outline}" stroke-width="1.3"/>
        <path d="M25 -20 l-1.5 -6 l5 2.5 z" fill="${outline}"/>
        <circle cx="28.5" cy="-16" r="1.3" fill="#191F28"/>
        <path d="M8 -7 Q15 -15 23 -19" stroke="${outline}" stroke-width="2.2" fill="none" opacity=".85"/>
        <ellipse cx="-4" cy="-4" rx="8" ry="3.5" fill="#fff" opacity=".28"/>
      </g>
    </g>`;
  fig.innerHTML = wrapSvg(
    `${SHADOW(180, 182, 130, 0.09)}
    <rect x="16" y="112" width="328" height="18" rx="6" fill="url(#hr-gr)" opacity=".9"/>
    <rect x="16" y="126" width="328" height="48" rx="10" fill="url(#hr-tk)" stroke="#8F6132" stroke-width="1.5"/>
    <line x1="24" y1="150" x2="336" y2="150" stroke="#fff" stroke-width="1.6" stroke-dasharray="9 8" opacity=".6"/>
    <line x1="36" y1="126" x2="36" y2="78" stroke="#54677A" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M36 78 L58 85 L36 92 Z" fill="#E8434F" stroke="#B32636" stroke-width="1"/>
    <line x1="44" y1="100" x2="146" y2="100" stroke="#0A87A3" stroke-width="1.6"/>
    <line x1="44" y1="96" x2="44" y2="104" stroke="#0A87A3" stroke-width="1.6"/>
    <line x1="146" y1="96" x2="146" y2="104" stroke="#0A87A3" stroke-width="1.6"/>
    <text x="95" y="94" text-anchor="middle" font-size="11.5" font-weight="800" fill="#0A87A3">6일</text>
    <text x="150" y="112" text-anchor="middle" font-size="11.5" font-weight="800" fill="#6B4520">80리</text>
    <text x="48" y="190" text-anchor="middle" font-size="11.5" font-weight="800" fill="#2E3E52">128리</text>
    ${horse("hr-slow", "hr-sl", "#6B4520", 150, 133)}
    ${horse("hr-fast", "hr-fa", "#1E2A38", 48, 155)}
    <g class="hr-fx" style="opacity:0; transform: scale(.4); transform-origin: 296px 118px; transition: transform .35s cubic-bezier(.34,1.6,.5,1), opacity .3s">
      ${star(296, 118, 30, 12, "#FFD98A", "#E8A21E")}
    </g>`,
    `<linearGradient id="hr-gr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A8DC8C"/><stop offset=".55" stop-color="#7FC46A"/><stop offset="1" stop-color="#569444"/></linearGradient>
    <linearGradient id="hr-tk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E8C89A"/><stop offset=".5" stop-color="#D4A86A"/><stop offset="1" stop-color="#B8854A"/></linearGradient>
    <linearGradient id="hr-sl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E8B88A"/><stop offset=".5" stop-color="#C88A52"/><stop offset="1" stop-color="#9C6132"/></linearGradient>
    <linearGradient id="hr-fa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8FA8CC"/><stop offset=".5" stop-color="#54677A"/><stop offset="1" stop-color="#2E3E52"/></linearGradient>`,
  );
  const btn = mkBtn("추격 시작");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML =
    "300년 전 조선 수학자 <b>홍정하</b>의 책 구일집에 실린 문제예요. 느린 말이 하루 <b>80리</b>씩 <b>6일 먼저</b> 출발했고, 빠른 말이 하루 <b>128리</b>로 뒤쫓아요. 며칠 만에 따라잡을까요?";
  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    (fig.querySelector(".hr-slow") as SVGGElement).style.transform = "translate(288px, 133px)";
    (fig.querySelector(".hr-fast") as SVGGElement).style.transform = "translate(296px, 155px)";
    window.setTimeout(() => {
      haptic(HAPTIC.correct);
      face("surprised");
      const fx = fig.querySelector(".hr-fx") as SVGGElement;
      fx.style.opacity = "1";
      fx.style.transform = "scale(1.05)";
      window.setTimeout(() => (fx.style.opacity = "0"), 650);
      helper.innerHTML = "따라잡았어요! 그날이 출발로부터 <b>며칠째</b>인지, 말을 다시 달리게 하지 않고도 아는 방법이 있을까요?";
      window.setTimeout(() => {
        ask(box, helper, {
          choices: choices ?? [
            "같은 거리를 간 순간을 등식으로: 128x=80(x+6)",
            "말을 실제로 달리게 해 봐야 안다",
            "느린 말이 영원히 앞선다",
          ],
          good: "그거예요! 만나는 순간 <b>두 말이 간 거리가 같다</b>, 빠른 말이 달린 날을 x로 두면 128x=80(x+6), 풀면 <b>x=10일</b>. 방정식 한 줄이 추격전을 끝내요. 문장을 식으로 바꾸는 법을 배워요.",
          bad: "실제로 달리면 10일이나 걸리고, 매일 48리씩 좁혀지니 영원히 앞서지도 못해요. 비법은 만나는 순간 <b>두 말이 간 거리가 같다</b>를 식으로 쓰기, 128x=80(x+6), 풀면 10일! 이 번역술이 이번 레슨의 마지막 기술이에요.",
          onDone: finish,
        });
      }, 700);
    }, 2450);
  });
};
