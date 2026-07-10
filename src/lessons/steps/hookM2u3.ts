// hookM2u3, 중2 수학 Ⅲ(일차함수) 훅 장면 10종. hookMath.ts의 mathHook이 디스패치한다.
// 장면 계약: (scene, helper, finish, face, choices?), 공용 hookAsk.ask()만 사용,
// choices[0]=정답, good≠bad(오개념 교정), 소재명·설정은 도입(helper/narrator)에서 소개.
// 조작 먼저 → 예측 나중. 상태 변화는 인라인 스타일 트랜지션 + setTimeout(rAF 금지).
// SVG 파운드리 문법: 3스톱 그라데이션 면 + 좌상단 키라이트 + 접촉 그림자(#2A3A5E) + 재질별 최암색 외곽선.
// 수학 UI 텍스트 em대시 금지(−와 혼동), 제목류는 콜론·본문은 쉼표.
// 장면: vendbox·bubbletea·twinlift·giftcard·slide·updown·bonekey·stalactite·twomask·chase
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

/* 배경 카드 그라데이션(장면 공용), 민트 크림 톤(단원 액센트 #0CA678 계열) */
const BG = `<linearGradient id="h3-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2FBF7"/><stop offset=".55" stop-color="#E6F5EE"/><stop offset="1" stop-color="#D8EEE3"/></linearGradient>`;
const CARD = `<rect x="10" y="8" width="340" height="184" rx="16" fill="url(#h3-bg)"/>`;
const SPRING = "var(--spring, cubic-bezier(.34,1.35,.5,1))";
const EASE = "cubic-bezier(.22,1,.36,1)";

/* 1 vendbox: 자판기 vs 랜덤박스, 같은 돈, 같은 버튼인데 결과는? (함수 = 정해지는 대응) */
export const renderVendbox: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  const can = (x: number, y: number, hue: string, dark: string, id: string, hidden = true): string =>
    `<g id="${id}" style="opacity:${hidden ? 0 : 1}; transition: opacity .4s, transform .5s ${SPRING}; transform: translateY(${hidden ? -8 : 0}px)">
      <rect x="${x}" y="${y}" width="20" height="30" rx="6" fill="${hue}" stroke="${dark}" stroke-width="1.4"/>
      <rect x="${x}" y="${y + 4}" width="20" height="5" fill="#FFFFFF" opacity=".35"/>
      <ellipse cx="${x + 6}" cy="${y + 8}" rx="3.4" ry="6" fill="#fff" opacity=".5"/>
    </g>`;
  const doll = (x: number, y: number, hue: string, dark: string, id: string): string =>
    `<g id="${id}" style="opacity:0; transition: opacity .4s, transform .5s ${SPRING}; transform: translateY(-8px)">
      <circle cx="${x}" cy="${y}" r="9" fill="${hue}" stroke="${dark}" stroke-width="1.4"/>
      <circle cx="${x - 6}" cy="${y - 8}" r="4" fill="${hue}" stroke="${dark}" stroke-width="1.2"/>
      <circle cx="${x + 6}" cy="${y - 8}" r="4" fill="${hue}" stroke="${dark}" stroke-width="1.2"/>
      <circle cx="${x - 3}" cy="${y - 1.5}" r="1.2" fill="#1E2A38"/><circle cx="${x + 3}" cy="${y - 1.5}" r="1.2" fill="#1E2A38"/>
      <ellipse cx="${x - 3}" cy="${y - 5}" rx="3" ry="1.6" fill="#fff" opacity=".55"/>
    </g>`;
  fig.innerHTML = wrapSvg(
    `${CARD}
    ${SHADOW(100, 178, 62, 0.12)}${SHADOW(262, 178, 58, 0.12)}
    <rect x="42" y="26" width="116" height="150" rx="12" fill="url(#vb-body)" stroke="#065F46" stroke-width="1.8"/>
    <rect x="52" y="38" width="62" height="70" rx="8" fill="url(#vb-glass)" stroke="#0A8F67" stroke-width="1.3"/>
    <ellipse cx="66" cy="48" rx="9" ry="4" fill="#fff" opacity=".5"/>
    ${can(58, 46, "url(#vb-can1)", "#0A6B4E", "vb-s1", false)}${can(84, 46, "url(#vb-can2)", "#8C4A10", "vb-s2", false)}
    ${can(58, 80, "url(#vb-can1)", "#0A6B4E", "vb-s3", false)}${can(84, 80, "url(#vb-can2)", "#8C4A10", "vb-s4", false)}
    <g id="vb-btns">
      <rect x="124" y="42" width="24" height="16" rx="5" fill="url(#vb-btn1)" stroke="#065F46" stroke-width="1.3"/>
      <rect x="124" y="64" width="24" height="16" rx="5" fill="url(#vb-btn2)" stroke="#8C4A10" stroke-width="1.3"/>
    </g>
    <rect x="56" y="128" width="72" height="30" rx="7" fill="#0B3B2C" stroke="#065F46" stroke-width="1.4"/>
    ${can(82, 127, "url(#vb-can1)", "#0A6B4E", "vb-out1")}
    <rect x="196" y="58" width="120" height="118" rx="12" fill="url(#vb-box)" stroke="#8C6A3A" stroke-width="1.8"/>
    <path d="M196 92 h120 M256 58 v118" stroke="#B08A52" stroke-width="1.4" opacity=".6"/>
    <text x="256" y="84" text-anchor="middle" font-size="26" font-weight="900" fill="#8C6A3A">?</text>
    <ellipse cx="216" cy="66" rx="12" ry="3" fill="#fff" opacity=".4"/>
    ${doll(232, 130, "url(#vb-d1)", "#9C3D5E", "vb-dollA")}
    ${doll(282, 130, "url(#vb-d2)", "#27408B", "vb-dollB")}`,
    `${BG}
    <linearGradient id="vb-body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#DFF5EC"/><stop offset=".5" stop-color="#B9E7D5"/><stop offset="1" stop-color="#93D6BC"/></linearGradient>
    <linearGradient id="vb-glass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#DCEEF2"/></linearGradient>
    <linearGradient id="vb-can1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7FE0BD"/><stop offset="1" stop-color="#0CA678"/></linearGradient>
    <linearGradient id="vb-can2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFD98A"/><stop offset="1" stop-color="#E8A93E"/></linearGradient>
    <linearGradient id="vb-btn1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B9F0DC"/><stop offset="1" stop-color="#4ECBA0"/></linearGradient>
    <linearGradient id="vb-btn2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE6B3"/><stop offset="1" stop-color="#EAB960"/></linearGradient>
    <linearGradient id="vb-box" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2E3C8"/><stop offset=".5" stop-color="#E3CBA0"/><stop offset="1" stop-color="#CDAC74"/></linearGradient>
    <radialGradient id="vb-d1" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#F5A8C0"/><stop offset="1" stop-color="#D8547E"/></radialGradient>
    <radialGradient id="vb-d2" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#9BB1F2"/><stop offset="1" stop-color="#4A63C8"/></radialGradient>`,
  );
  const btn = mkBtn("둘 다 눌러 보기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "왼쪽은 <b>자판기</b>, 오른쪽은 뭐가 나올지 모르는 <b>랜덤박스</b>예요. 같은 돈을 넣고 눌러 볼까요?";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    const show = (id: string): void => {
      const g = q<SVGGElement>(fig, `#${id}`);
      g.style.opacity = "1";
      g.style.transform = "translateY(0)";
    };
    window.setTimeout(() => {
      show("vb-out1");
      haptic(HAPTIC.tap);
    }, 420);
    window.setTimeout(() => {
      const box2 = q<SVGGElement>(fig, "#vb-dollA");
      box2.style.opacity = "1";
      box2.style.transform = "translateY(0)";
      haptic(HAPTIC.tap);
    }, 1050);
    window.setTimeout(() => show("vb-dollB"), 1650);
    window.setTimeout(() => {
      face("surprised");
      helper.innerHTML =
        "자판기는 초록 버튼에서 늘 <b>같은 음료</b>, 랜덤박스는 매번 <b>다른 인형</b>이 나왔어요. 한 번 더 산다면, 결과를 확실히 아는 쪽은?";
      ask(box, helper, {
        choices: choices ?? [
          "자판기예요, 버튼 하나에 나오는 것이 하나로 딱 정해져 있으니까요",
          "랜덤박스예요, 이제 나올 인형이 몇 개 안 남았으니까요",
          "둘 다 알 수 없어요, 기계는 원래 예측 불가니까요",
        ],
        good: "정확해요! 자판기는 '넣는 것'이 정해지면 '나오는 것'이 하나로 정해져요. 이런 <b>정해지는 대응</b>에 수학자들이 붙인 이름이 오늘의 주인공이에요.",
        bad: "랜덤박스는 남은 개수를 알아도 '무엇이 나올지'는 끝까지 복불복이에요. 반대로 자판기는 버튼 하나에 결과가 하나로 딱 정해지죠. 이 차이가 오늘 배울 개념의 핵심이에요!",
        onDone: finish,
      });
    }, 2350);
  });
};

/* 2 bubbletea: 버블티 토핑, 기본값 + 개당 500원, 일정하게 커지는 규칙(일차함수의 몸) */
export const renderBubbletea: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  // 펄 4알을 컵 중심(x=180)에 정렬 — 4알 폭 39px의 절반을 빼서 시작(160.5). 컵 벽 안쪽 검산:
  // 가장 낮은 줄 y=160에서 벽은 x≈144.8~215.2, 펄 양 끝은 155.1~204.9로 여유 있게 안쪽이다.
  const pearlRow = (id: number, y: number): string =>
    `<g id="bt-top${id}" style="opacity:0; transition: opacity .4s, transform .45s ${SPRING}; transform: translateY(-6px)">
      ${[0, 1, 2, 3].map((i) => `<circle cx="${160.5 + i * 13}" cy="${y}" r="5.4" fill="url(#bt-pearl)" stroke="#3E2723" stroke-width="1.2"/>`).join("")}
    </g>`;
  fig.innerHTML = wrapSvg(
    `${CARD}
    ${SHADOW(180, 180, 56, 0.12)}
    <path d="M134 52 L226 52 L214 172 L146 172 Z" fill="url(#bt-cup)" stroke="#0A6B4E" stroke-width="1.8"/>
    <path d="M138 96 L222 96 L214 172 L146 172 Z" fill="url(#bt-tea)" opacity=".9"/>
    <rect x="130" y="44" width="100" height="10" rx="5" fill="url(#bt-lid)" stroke="#0A6B4E" stroke-width="1.4"/>
    <rect x="196" y="18" width="9" height="52" rx="4.5" fill="url(#bt-straw)" stroke="#065F46" stroke-width="1.2" transform="rotate(12 200 44)"/>
    <ellipse cx="152" cy="66" rx="7" ry="16" fill="#fff" opacity=".35"/>
    ${pearlRow(1, 160)}${pearlRow(2, 146)}${pearlRow(3, 132)}
    <g id="bt-price">
      <rect x="246" y="64" width="86" height="44" rx="12" fill="url(#bt-tag)" stroke="#065F46" stroke-width="1.5"/>
      <text x="289" y="82" text-anchor="middle" font-size="10" font-weight="800" fill="#0A6B4E">가격</text>
      <text id="bt-won" x="289" y="99" text-anchor="middle" font-size="14" font-weight="900" fill="#065F46">3800원</text>
      <ellipse cx="260" cy="70" rx="9" ry="2.6" fill="#fff" opacity=".5"/>
    </g>
    <g id="bt-cnt">
      <rect x="34" y="64" width="86" height="44" rx="12" fill="#FFFFFF" stroke="#C8DAD2" stroke-width="1.5"/>
      <text x="77" y="82" text-anchor="middle" font-size="10" font-weight="800" fill="#64748B">토핑</text>
      <text id="bt-n" x="77" y="99" text-anchor="middle" font-size="14" font-weight="900" fill="#334155">0개</text>
    </g>`,
    `${BG}
    <linearGradient id="bt-cup" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FDFEFE"/><stop offset=".6" stop-color="#EAF4F0"/><stop offset="1" stop-color="#D8E8E1"/></linearGradient>
    <linearGradient id="bt-tea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2D9B8"/><stop offset="1" stop-color="#D9AE7E"/></linearGradient>
    <linearGradient id="bt-lid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#DFF5EC"/><stop offset="1" stop-color="#A5E0CC"/></linearGradient>
    <linearGradient id="bt-straw" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4ECBA0"/><stop offset="1" stop-color="#0A8F67"/></linearGradient>
    <radialGradient id="bt-pearl" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#8D6E63"/><stop offset="1" stop-color="#4E342E"/></radialGradient>
    <linearGradient id="bt-tag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E7F8F1"/><stop offset="1" stop-color="#C5EBDB"/></linearGradient>`,
  );
  const btn = mkBtn("토핑 추가 (+500원)");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "버블티 기본이 <b>3800원</b>, 펄 토핑은 <b>한 줄에 500원</b>이래요. 마음껏 추가해 볼까요?";

  let n = 0;
  btn.addEventListener("click", () => {
    if (n >= 3) return;
    n += 1;
    haptic(HAPTIC.tap);
    const row = q<SVGGElement>(fig, `#bt-top${n}`);
    row.style.opacity = "1";
    row.style.transform = "translateY(0)";
    q<SVGTextElement>(fig, "#bt-n").textContent = `${n}개`;
    q<SVGTextElement>(fig, "#bt-won").textContent = `${3800 + 500 * n}원`;
    if (n === 3) {
      btn.disabled = true;
      btn.classList.remove("pulse");
      window.setTimeout(() => {
        face("curious");
        helper.innerHTML = "3800 → 4300 → 4800 → 5300원. 토핑을 하나 올릴 때마다 가격은 <b>어떻게 변하고 있나요</b>?";
        ask(box, helper, {
          choices: choices ?? [
            "늘 500원씩, 일정하게 계단처럼 올라요",
            "토핑이 많아질수록 점점 가파르게 뛰어요",
            "그때그때 불규칙하게 달라져요",
          ],
          good: "맞아요! 시작값 3800원에서 <b>한 개당 500원씩 일정하게</b>. 이렇게 '일정하게 변하는 관계'를 식 한 줄로 붙잡는 법을 오늘 배워요.",
          bad: "영수증을 다시 봐요. 4300, 4800, 5300, 차이가 전부 500원으로 똑같아요! 시작값에 일정량씩 쌓이는 이 규칙이 오늘 배울 식의 정체예요.",
          onDone: finish,
        });
      }, 700);
    }
  });
};

/* 3 twinlift: 같은 속도 두 엘리베이터, 출발층만 다르면 높이 그래프는 나란히(평행이동) */
export const renderTwinlift: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  fig.innerHTML = wrapSvg(
    `${CARD}
    ${SHADOW(90, 182, 66, 0.12)}
    <rect x="34" y="20" width="52" height="158" rx="8" fill="url(#tl3-shaft)" stroke="#5E6C78" stroke-width="1.6"/>
    <rect x="98" y="20" width="52" height="158" rx="8" fill="url(#tl3-shaft)" stroke="#5E6C78" stroke-width="1.6"/>
    ${[0, 1, 2, 3, 4].map((i) => `<line x1="36" y1="${170 - i * 34}" x2="84" y2="${170 - i * 34}" stroke="#8FA0B0" stroke-width="1" opacity=".6"/><line x1="100" y1="${170 - i * 34}" x2="148" y2="${170 - i * 34}" stroke="#8FA0B0" stroke-width="1" opacity=".6"/>`).join("")}
    <g id="tl3-carA" style="transition: transform 1.6s ${EASE}">
      <rect x="40" y="140" width="40" height="30" rx="5" fill="url(#tl3-carGa)" stroke="#065F46" stroke-width="1.6"/>
      <line x1="60" y1="140" x2="60" y2="170" stroke="#065F46" stroke-width="1.2"/>
      <ellipse cx="50" cy="146" rx="6" ry="2.4" fill="#fff" opacity=".5"/>
    </g>
    <g id="tl3-carB" style="transition: transform 1.6s ${EASE}">
      <rect x="104" y="72" width="40" height="30" rx="5" fill="url(#tl3-carGb)" stroke="#8C4A10" stroke-width="1.6"/>
      <line x1="124" y1="72" x2="124" y2="102" stroke="#8C4A10" stroke-width="1.2"/>
      <ellipse cx="114" cy="78" rx="6" ry="2.4" fill="#fff" opacity=".5"/>
    </g>
    <g>
      <line x1="188" y1="170" x2="336" y2="170" stroke="#5E6C78" stroke-width="1.8"/>
      <line x1="192" y1="176" x2="192" y2="30" stroke="#5E6C78" stroke-width="1.8"/>
      <text x="330" y="184" font-size="9" font-weight="800" fill="#64748B">시간</text>
      <text x="200" y="34" font-size="9" font-weight="800" fill="#64748B">높이</text>
      <path id="tl3-lineA" d="M192 150 L320 62" stroke="url(#tl3-ga)" stroke-width="3.4" stroke-linecap="round" stroke-dasharray="158" stroke-dashoffset="158" style="transition: stroke-dashoffset 1.6s ${EASE}"/>
      <path id="tl3-lineB" d="M192 116 L320 28" stroke="url(#tl3-gb)" stroke-width="3.4" stroke-linecap="round" stroke-dasharray="158" stroke-dashoffset="158" style="transition: stroke-dashoffset 1.6s ${EASE}"/>
    </g>`,
    `${BG}
    <linearGradient id="tl3-shaft" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#EDF2F7"/><stop offset=".5" stop-color="#DCE5EE"/><stop offset="1" stop-color="#C3D0DE"/></linearGradient>
    <linearGradient id="tl3-carGa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7FE0BD"/><stop offset="1" stop-color="#0CA678"/></linearGradient>
    <linearGradient id="tl3-carGb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFD98A"/><stop offset="1" stop-color="#E8A93E"/></linearGradient>
    <linearGradient id="tl3-ga" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#0A8F67"/><stop offset="1" stop-color="#4ECBA0"/></linearGradient>
    <linearGradient id="tl3-gb" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#C98A2E"/><stop offset="1" stop-color="#FFD98A"/></linearGradient>`,
  );
  const btn = mkBtn("동시에 출발!");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML =
    "쌍둥이 엘리베이터예요. 속도는 완전히 같은데 초록은 <b>1층</b>, 주황은 <b>3층</b>에서 출발해요. 높이 그래프를 그리면?";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    q<SVGGElement>(fig, "#tl3-carA").style.transform = "translateY(-102px)";
    q<SVGGElement>(fig, "#tl3-carB").style.transform = "translateY(-51px)";
    q<SVGPathElement>(fig, "#tl3-lineA").style.strokeDashoffset = "0";
    q<SVGPathElement>(fig, "#tl3-lineB").style.strokeDashoffset = "0";
    window.setTimeout(() => {
      face("surprised");
      helper.innerHTML = "두 그래프가 그려졌어요! 시간이 아무리 지나도 두 엘리베이터의 <b>높이 차이</b>는 어떻게 될까요?";
      ask(box, helper, {
        choices: choices ?? [
          "처음 차이 그대로, 그래프도 나란히 가요",
          "빠른 쪽이 없으니 점점 가까워져서 만나요",
          "위에 있던 주황이 두 배로 벌려 나가요",
        ],
        good: "정확해요! 속도(기울어짐)가 같으니 차이는 영원히 그대로, 그래프는 <b>나란한 두 직선</b>이 돼요. 한 직선을 통째로 밀어 올린 모양이죠. 오늘 그 '밀어 올리기'를 직접 해 봐요.",
        bad: "속도가 똑같다는 게 핵심이에요. 따라잡지도, 더 벌어지지도 않아요. 높이 차이는 처음 그대로, 그래프는 나란한 두 직선! 한 직선을 통째로 밀어 올린 모양이에요.",
        onDone: finish,
      });
    }, 1900);
  });
};

/* 4 giftcard: 기프트카드 잔액, 일정하게 줄어드는 직선, 잔액 0이 되는 날(절편의 예감) */
export const renderGiftcard: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  fig.innerHTML = wrapSvg(
    `${CARD}
    ${SHADOW(86, 118, 58, 0.12)}
    <g transform="rotate(-4 86 78)">
      <rect x="30" y="48" width="112" height="66" rx="10" fill="url(#gc-card)" stroke="#065F46" stroke-width="1.8"/>
      <rect x="30" y="60" width="112" height="12" fill="#065F46" opacity=".85"/>
      <circle cx="122" cy="96" r="9" fill="url(#gc-coin)" stroke="#9C5A10" stroke-width="1.3"/>
      <text x="44" y="98" font-size="11" font-weight="900" fill="#065F46">GIFT</text>
      <ellipse cx="48" cy="54" rx="12" ry="3" fill="#fff" opacity=".5"/>
    </g>
    <g id="gc-bal">
      <rect x="34" y="128" width="104" height="34" rx="10" fill="#FFFFFF" stroke="#C8DAD2" stroke-width="1.4"/>
      <text x="86" y="142" text-anchor="middle" font-size="9" font-weight="800" fill="#64748B">잔액</text>
      <text id="gc-won" x="86" y="156" text-anchor="middle" font-size="13" font-weight="900" fill="#067D57">30000원</text>
    </g>
    <g>
      <line x1="180" y1="162" x2="340" y2="162" stroke="#5E6C78" stroke-width="1.8"/>
      <line x1="186" y1="170" x2="186" y2="34" stroke="#5E6C78" stroke-width="1.8"/>
      <text x="322" y="178" font-size="9" font-weight="800" fill="#64748B">날짜</text>
      <text x="194" y="38" font-size="9" font-weight="800" fill="#64748B">잔액</text>
      <path id="gc-line" d="M186 52 L326 162" stroke="url(#gc-gl)" stroke-width="3.4" stroke-linecap="round" stroke-dasharray="180" stroke-dashoffset="180" style="transition: stroke-dashoffset 1.8s ${EASE}"/>
      <g id="gc-hit" style="opacity:0; transition: opacity .5s, transform .5s ${SPRING}; transform: scale(.4); transform-origin: 326px 162px">
        <circle cx="326" cy="162" r="8" fill="none" stroke="#E8A93E" stroke-width="2.6"/>
        <circle cx="326" cy="162" r="3" fill="#E8A93E"/>
      </g>
    </g>`,
    `${BG}
    <linearGradient id="gc-card" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#DFF5EC"/><stop offset=".5" stop-color="#B9E7D5"/><stop offset="1" stop-color="#8FD4B8"/></linearGradient>
    <radialGradient id="gc-coin" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#FFE3A0"/><stop offset="1" stop-color="#E8A93E"/></radialGradient>
    <linearGradient id="gc-gl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0CA678"/><stop offset="1" stop-color="#E8608A"/></linearGradient>`,
  );
  const btn = mkBtn("한 달 빨리 감기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML =
    "3만원짜리 카페 <b>기프트카드</b>가 생겼어요! 매일 아침 같은 음료를 사서 <b>하루 1000원씩</b> 잔액이 줄어요.";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    q<SVGPathElement>(fig, "#gc-line").style.strokeDashoffset = "0";
    const won = q<SVGTextElement>(fig, "#gc-won");
    [24000, 16000, 8000, 0].forEach((v, i) => {
      window.setTimeout(() => {
        won.textContent = `${v}원`;
        if (v === 0) won.setAttribute("fill", "#D93440");
        haptic(HAPTIC.tap);
      }, 400 + i * 400);
    });
    window.setTimeout(() => {
      const hit = q<SVGGElement>(fig, "#gc-hit");
      hit.style.opacity = "1";
      hit.style.transform = "scale(1)";
      haptic(HAPTIC.correct);
    }, 2000);
    window.setTimeout(() => {
      face("curious");
      helper.innerHTML = "잔액 그래프가 쭉 내려와 <b>0원</b>이 됐어요. '잔액이 바닥나는 날'은 그래프의 <b>어디</b>에서 읽을까요?";
      ask(box, helper, {
        choices: choices ?? [
          "직선이 가로축(날짜축)과 만나는 곳이요",
          "직선이 세로축(잔액축)과 만나는 곳이요",
          "그래프에서는 알 수 없어요",
        ],
        good: "바로 그거예요! 가로축과 만나는 점은 '잔액이 0이 되는 순간'. 축과 만나는 점에는 특별한 이름이 있는데, 오늘 그 점들을 수집하러 가요.",
        bad: "세로축과 만나는 점은 '0일째의 잔액', 그러니까 처음 3만원이에요. 바닥나는 날은 잔액이 0이 되는 곳, 즉 <b>가로축과 만나는 점</b>! 축과 만나는 두 점의 이름을 오늘 배워요.",
        onDone: finish,
      });
    }, 2600);
  });
};

/* 5 slide: 같은 높이 두 미끄럼틀, 무서움의 정체는 (수직)/(수평) 비율(기울기의 예감) */
export const renderSlide: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  fig.innerHTML = wrapSvg(
    `${CARD}
    ${SHADOW(96, 180, 74, 0.12)}${SHADOW(262, 180, 76, 0.12)}
    <rect x="38" y="56" width="14" height="120" rx="4" fill="url(#sl-pole)" stroke="#5E6C78" stroke-width="1.4"/>
    <path d="M52 60 L128 176 L112 176 L52 84 Z" fill="url(#sl-rampA)" stroke="#0A6B4E" stroke-width="1.8"/>
    <rect x="34" y="48" width="30" height="14" rx="5" fill="url(#sl-top)" stroke="#0A6B4E" stroke-width="1.4"/>
    <ellipse cx="44" cy="52" rx="7" ry="2" fill="#fff" opacity=".5"/>
    <rect x="192" y="56" width="14" height="120" rx="4" fill="url(#sl-pole)" stroke="#5E6C78" stroke-width="1.4"/>
    <path d="M206 60 L342 176 L326 176 L206 84 Z" fill="url(#sl-rampB)" stroke="#8C4A10" stroke-width="1.8"/>
    <rect x="188" y="48" width="30" height="14" rx="5" fill="url(#sl-top)" stroke="#8C4A10" stroke-width="1.4"/>
    <ellipse cx="198" cy="52" rx="7" ry="2" fill="#fff" opacity=".5"/>
    <g id="sl-ballA" style="transition: transform .9s cubic-bezier(.5,0,.9,.6)">
      <circle cx="58" cy="52" r="8" fill="url(#sl-ball)" stroke="#9C3D5E" stroke-width="1.5"/>
      <ellipse cx="55" cy="49" rx="2.6" ry="1.6" fill="#fff" opacity=".65"/>
    </g>
    <g id="sl-ballB" style="transition: transform 1.7s ${EASE}">
      <circle cx="212" cy="52" r="8" fill="url(#sl-ball2)" stroke="#27408B" stroke-width="1.5"/>
      <ellipse cx="209" cy="49" rx="2.6" ry="1.6" fill="#fff" opacity=".65"/>
    </g>
    <g id="sl-dims" style="opacity:0; transition: opacity .6s">
      <path d="M52 186 h72" stroke="#0A6B4E" stroke-width="1.8" stroke-dasharray="4 3"/>
      <text x="88" y="197" text-anchor="middle" font-size="9" font-weight="900" fill="#0A6B4E">가로 2</text>
      <path d="M206 186 h132" stroke="#8C4A10" stroke-width="1.8" stroke-dasharray="4 3"/>
      <text x="272" y="197" text-anchor="middle" font-size="9" font-weight="900" fill="#8C4A10">가로 4</text>
    </g>`,
    `${BG}
    <linearGradient id="sl-pole" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E8EEF4"/><stop offset="1" stop-color="#B8C6D4"/></linearGradient>
    <linearGradient id="sl-top" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#DFF5EC"/><stop offset="1" stop-color="#A5E0CC"/></linearGradient>
    <linearGradient id="sl-rampA" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7FE0BD"/><stop offset=".5" stop-color="#2BBA8C"/><stop offset="1" stop-color="#0A8F67"/></linearGradient>
    <linearGradient id="sl-rampB" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFE6B3"/><stop offset=".5" stop-color="#F0BE62"/><stop offset="1" stop-color="#C98A2E"/></linearGradient>
    <radialGradient id="sl-ball" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#F5A8C0"/><stop offset="1" stop-color="#D8547E"/></radialGradient>
    <radialGradient id="sl-ball2" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#9BB1F2"/><stop offset="1" stop-color="#4A63C8"/></radialGradient>`,
  );
  const btn = mkBtn("공 굴리기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML =
    "놀이터의 두 <b>미끄럼틀</b>, 높이는 완전히 똑같아요. 그런데 왼쪽만 타면 비명이 나와요. 공을 굴려서 확인해 볼까요?";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    q<SVGGElement>(fig, "#sl-ballA").style.transform = "translate(64px, 118px)";
    q<SVGGElement>(fig, "#sl-ballB").style.transform = "translate(124px, 118px)";
    window.setTimeout(() => {
      q<SVGGElement>(fig, "#sl-dims").style.opacity = "1";
      haptic(HAPTIC.tap);
    }, 1300);
    window.setTimeout(() => {
      face("surprised");
      helper.innerHTML =
        "초록 공이 훨씬 빨리 떨어졌어요! 높이(세로)는 같은데, 왼쪽 미끄럼틀이 더 가파른 <b>진짜 이유</b>는 뭘까요?";
      ask(box, helper, {
        choices: choices ?? [
          "같은 세로 높이를 더 짧은 가로 거리로 내려가서요",
          "왼쪽 미끄럼틀이 더 높은 곳에서 시작해서요",
          "왼쪽 미끄럼틀의 길이가 더 길어서요",
        ],
        good: "정확해요! 가파름의 정체는 높이 하나만도, 길이 하나만도 아닌 <b>(세로)÷(가로)의 비율</b>이에요. 오늘 이 비율에 이름을 붙이고 직선에서 재는 법을 배워요.",
        bad: "두 미끄럼틀의 세로 높이는 똑같았어요! 다른 건 가로 거리, 왼쪽은 같은 높이를 <b>절반의 가로 거리</b>로 내려와요. 가파름 = (세로)÷(가로) 비율, 이게 오늘의 주인공이에요.",
        onDone: finish,
      });
    }, 2100);
  });
};

/* 6 updown: 두 채널 구독자 그래프, 방향을 가르는 것(a의 부호), 성질의 예감 */
export const renderUpdown: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  fig.innerHTML = wrapSvg(
    `${CARD}
    <rect x="28" y="26" width="304" height="148" rx="12" fill="url(#ud-panel)" stroke="#C8DAD2" stroke-width="1.5"/>
    <line x1="46" y1="156" x2="316" y2="156" stroke="#5E6C78" stroke-width="1.6"/>
    <line x1="50" y1="162" x2="50" y2="40" stroke="#5E6C78" stroke-width="1.6"/>
    ${[1, 2, 3].map((i) => `<line x1="${50 + i * 66}" y1="156" x2="${50 + i * 66}" y2="46" stroke="#E2E9F2" stroke-width="1"/>`).join("")}
    <text x="300" y="170" font-size="8.5" font-weight="800" fill="#64748B">개월</text>
    <text x="58" y="44" font-size="8.5" font-weight="800" fill="#64748B">구독자</text>
    <circle cx="76" cy="120" r="10" fill="url(#ud-chA)" stroke="#0A6B4E" stroke-width="1.4"/>
    <path d="M72 120 l3 3 l5 -6" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>
    <circle cx="76" cy="70" r="10" fill="url(#ud-chB)" stroke="#8C1F30" stroke-width="1.4"/>
    <path d="M71 67 h10 M76 62 v10" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
    <path id="ud-lineA" d="M92 122 L184 100 L250 82 L308 62" stroke="url(#ud-ga)" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="230" stroke-dashoffset="230" style="transition: stroke-dashoffset 1.7s ${EASE}"/>
    <path id="ud-lineB" d="M92 74 L184 92 L250 108 L308 126" stroke="url(#ud-gb)" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="230" stroke-dashoffset="230" style="transition: stroke-dashoffset 1.7s ${EASE}"/>
    <ellipse cx="70" cy="34" rx="16" ry="3" fill="#fff" opacity=".5"/>`,
    `${BG}
    <linearGradient id="ud-panel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#EFF6F2"/></linearGradient>
    <radialGradient id="ud-chA" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#7FE0BD"/><stop offset="1" stop-color="#0CA678"/></radialGradient>
    <radialGradient id="ud-chB" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#F58C9C"/><stop offset="1" stop-color="#D8465C"/></radialGradient>
    <linearGradient id="ud-ga" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#0A8F67"/><stop offset="1" stop-color="#4ECBA0"/></linearGradient>
    <linearGradient id="ud-gb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#D8465C"/><stop offset="1" stop-color="#F58C9C"/></linearGradient>`,
  );
  const btn = mkBtn("넉 달 치 그리기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML =
    "두 유튜브 채널의 <b>구독자 그래프</b>예요. 초록 채널은 시작이 초라했고, 빨강 채널은 시작이 화려했죠. 넉 달을 지켜볼까요?";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    q<SVGPathElement>(fig, "#ud-lineA").style.strokeDashoffset = "0";
    q<SVGPathElement>(fig, "#ud-lineB").style.strokeDashoffset = "0";
    window.setTimeout(() => {
      face("curious");
      helper.innerHTML =
        "결국 초록이 빨강을 앞질렀어요! 두 그래프의 운명을 가른 <b>단 하나</b>는 뭘까요?";
      ask(box, helper, {
        choices: choices ?? [
          "그래프의 방향이에요, 오른쪽 위로 가느냐 아래로 가느냐",
          "출발점 높이예요, 시작 구독자가 많아야 이겨요",
          "그래프의 길이예요, 길게 그린 쪽이 이겨요",
        ],
        good: "그렇죠! 시작이 아무리 높아도 <b>오른쪽 아래로 향하는 그래프</b>는 결국 져요. 이 '방향'을 식의 어떤 수가 결정하는지, 오늘 조종간을 잡고 확인해요.",
        bad: "빨강은 시작이 훨씬 높았는데도 졌어요! 승부를 가른 건 출발점이 아니라 <b>방향</b>, 오른쪽 위로 가느냐 아래로 가느냐예요. 그 방향을 정하는 수를 오늘 찾아내요.",
        onDone: finish,
      });
    }, 2000);
  });
};

/* 7 bonekey: 법의학, 뼈 한 조각으로 키를 추정(식 구하기의 위력) */
export const renderBonekey: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  fig.innerHTML = wrapSvg(
    `${CARD}
    ${SHADOW(110, 148, 76, 0.12)}
    <g transform="rotate(-8 110 108)">
      <path d="M56 116 Q52 108 58 103 Q64 98 70 104 L150 96 Q154 88 162 92 Q170 95 166 104 Q174 106 170 114 Q166 121 158 118 L74 126 Q70 134 62 130 Q54 127 56 116 Z" fill="url(#bk-bone)" stroke="#B8A88C" stroke-width="1.6"/>
      <ellipse cx="66" cy="106" rx="6" ry="3" fill="#fff" opacity=".6"/>
    </g>
    <g id="bk-ruler" style="opacity:0; transition: opacity .5s, transform .6s ${EASE}; transform: translateY(10px)">
      <rect x="50" y="142" width="124" height="16" rx="4" fill="url(#bk-rule)" stroke="#8C6A3A" stroke-width="1.4"/>
      ${Array.from({ length: 12 }, (_, i) => `<line x1="${56 + i * 10}" y1="142" x2="${56 + i * 10}" y2="${i % 5 === 0 ? 152 : 148}" stroke="#6B4E2A" stroke-width="1"/>`).join("")}
    </g>
    <g id="bk-calc" style="opacity:0; transition: opacity .5s, transform .5s ${SPRING}; transform: scale(.6); transform-origin: 268px 96px">
      <rect x="206" y="46" width="126" height="100" rx="12" fill="url(#bk-note)" stroke="#065F46" stroke-width="1.6"/>
      <text x="269" y="68" text-anchor="middle" font-size="10" font-weight="900" fill="#0A6B4E">뼈 길이 46cm</text>
      <line x1="220" y1="78" x2="318" y2="78" stroke="#9CC8B6" stroke-width="1.2"/>
      <text x="269" y="96" text-anchor="middle" font-size="10.5" font-weight="800" fill="#334155">키 = 뼈 길이 × 2 + 81</text>
      <text id="bk-h" x="269" y="126" text-anchor="middle" font-size="17" font-weight="900" fill="#067D57" opacity="0" style="transition: opacity .5s">약 173cm</text>
      <ellipse cx="228" cy="54" rx="12" ry="3" fill="#fff" opacity=".5"/>
    </g>
    <circle cx="150" cy="52" r="24" fill="none" stroke="#5E6C78" stroke-width="3"/>
    <line x1="167" y1="70" x2="184" y2="88" stroke="#5E6C78" stroke-width="5" stroke-linecap="round"/>
    <circle cx="150" cy="52" r="21" fill="url(#bk-lens)" opacity=".55"/>
    <ellipse cx="142" cy="44" rx="7" ry="4" fill="#fff" opacity=".7"/>`,
    `${BG}
    <linearGradient id="bk-bone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FDFBF4"/><stop offset=".55" stop-color="#F1E9D6"/><stop offset="1" stop-color="#DDD0B4"/></linearGradient>
    <linearGradient id="bk-rule" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2E3C8"/><stop offset="1" stop-color="#D9BC8C"/></linearGradient>
    <linearGradient id="bk-note" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E9F6F0"/></linearGradient>
    <radialGradient id="bk-lens" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#EAF6FF"/><stop offset="1" stop-color="#BFD9EC"/></radialGradient>`,
  );
  const btn = mkBtn("뼈 길이 재기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML =
    "발굴 현장에서 <b>넙다리뼈 한 조각</b>이 나왔어요. 놀랍게도 과학자들은 이것만으로 그 사람의 <b>키</b>를 알아낸대요!";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    const ruler = q<SVGGElement>(fig, "#bk-ruler");
    ruler.style.opacity = "1";
    ruler.style.transform = "translateY(0)";
    window.setTimeout(() => {
      const calc = q<SVGGElement>(fig, "#bk-calc");
      calc.style.opacity = "1";
      calc.style.transform = "scale(1)";
      haptic(HAPTIC.tap);
    }, 900);
    window.setTimeout(() => {
      q<SVGTextElement>(fig, "#bk-h").style.opacity = "1";
      haptic(HAPTIC.correct);
    }, 1800);
    window.setTimeout(() => {
      face("surprised");
      helper.innerHTML = "뼈 46cm를 재니 키 약 173cm가 나왔어요. 뼈 하나로 키를 아는 <b>비밀</b>은 뭘까요?";
      ask(box, helper, {
        choices: choices ?? [
          "뼈 길이와 키를 잇는 관계식이 미리 구해져 있어서요",
          "넙다리뼈 길이가 정확히 키의 절반이라서요",
          "과학자의 오랜 감으로 어림한 거예요",
        ],
        good: "맞아요! 수많은 사람의 자료에서 '뼈가 1cm 길수록 키가 일정하게 큰' 관계를 찾아 식으로 만들어 둔 거예요. 오늘은 우리가 직접 단서로 그 식을 만들어 봐요.",
        bad: "절반이라기엔 46의 두 배는 92cm뿐이고, 감이라기엔 너무 정확해요. 진짜 비밀은 자료에서 미리 구해 둔 <b>관계식</b>! 단서 몇 개로 식을 만드는 법을 오늘 배워요.",
        onDone: finish,
      });
    }, 2500);
  });
};

/* 8 stalactite: 종유석, 일정하게 자라는 자연의 직선(활용: 식 세우고 예측) */
export const renderStalactite: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  fig.innerHTML = wrapSvg(
    `${CARD}
    <path d="M10 8 h340 v34 q-46 16 -88 8 q-52 -10 -104 2 q-62 14 -104 -2 q-24 -8 -44 -4 Z" fill="url(#st-rock)" stroke="#5E5346" stroke-width="1.6"/>
    <g id="st-tite">
      <path id="st-body" d="M164 44 q-3 34 8 62 q7 20 8 30 q1 12 -8 12 q-9 0 -8 -12" fill="url(#st-stone)" stroke="#8C7A5E" stroke-width="1.6" style="transition: transform 1.8s ${EASE}; transform-origin: 172px 44px"/>
      <ellipse cx="167" cy="70" rx="3" ry="12" fill="#fff" opacity=".35"/>
    </g>
    <g id="st-drop" style="opacity:0; transition: opacity .4s">
      <circle cx="172" cy="152" r="3.4" fill="url(#st-water)" stroke="#4C7FA8" stroke-width="1"/>
    </g>
    <g id="st-tag" style="opacity:0; transition: opacity .5s, transform .5s ${SPRING}; transform: scale(.6); transform-origin: 268px 104px">
      <rect x="216" y="76" width="106" height="56" rx="12" fill="#FFFFFF" stroke="#065F46" stroke-width="1.5"/>
      <text x="269" y="96" text-anchor="middle" font-size="9.5" font-weight="800" fill="#64748B">자라는 속도</text>
      <text x="269" y="116" text-anchor="middle" font-size="12.5" font-weight="900" fill="#067D57">10년에 2mm</text>
      <ellipse cx="230" cy="82" rx="9" ry="2.4" fill="#fff" opacity=".5"/>
    </g>
    ${SHADOW(172, 184, 40, 0.1)}`,
    `${BG}
    <linearGradient id="st-rock" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8B7B64"/><stop offset=".6" stop-color="#6E614E"/><stop offset="1" stop-color="#55493A"/></linearGradient>
    <linearGradient id="st-stone" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#EFE6D2"/><stop offset=".5" stop-color="#D9C9A8"/><stop offset="1" stop-color="#B8A57E"/></linearGradient>
    <radialGradient id="st-water" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#DFF2FF"/><stop offset="1" stop-color="#8FBEDD"/></radialGradient>`,
  );
  const btn = mkBtn("100년 빨리 감기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML =
    "석회 동굴 천장의 <b>종유석</b>이에요. 물방울이 떨어지며 아주 조금씩, 하지만 <b>일정한 빠르기</b>로 자라요.";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    const drop = q<SVGGElement>(fig, "#st-drop");
    drop.style.opacity = "1";
    q<SVGPathElement>(fig, "#st-body").style.transform = "scaleY(1.28)";
    window.setTimeout(() => {
      const tag = q<SVGGElement>(fig, "#st-tag");
      tag.style.opacity = "1";
      tag.style.transform = "scale(1)";
      haptic(HAPTIC.tap);
    }, 1300);
    window.setTimeout(() => {
      face("curious");
      helper.innerHTML =
        "100년에 겨우 손톱만큼! 그렇다면 <b>500년 뒤</b>의 길이를 알고 싶으면 어떻게 해야 할까요?";
      ask(box, helper, {
        choices: choices ?? [
          "지금 길이에 '늘어날 양'을 더하는 식을 세워 계산해요",
          "500년 동안 기다렸다가 직접 재요",
          "미래의 일이라 수학으로는 알 수 없어요",
        ],
        good: "그거예요! <b>일정하게 변하는 것은 식으로 미래를 예측</b>할 수 있어요. 처음 길이가 시작값, 자라는 속도가 변화율. 오늘 이 예측 기술을 연습해요.",
        bad: "500년을 기다릴 순 없죠! 다행히 종유석은 '일정하게' 자라요. 일정하게 변하는 것은 (지금 길이)+(속도×시간) 식으로 미래를 계산할 수 있어요. 그게 오늘의 기술!",
        onDone: finish,
      });
    }, 2100);
  });
};

/* 9 twomask: 같은 직선의 두 얼굴, 방정식 카드를 뒤집으면 함수 카드(일차방정식↔일차함수) */
export const renderTwomask: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  fig.innerHTML = wrapSvg(
    `${CARD}
    ${SHADOW(100, 162, 62, 0.12)}
    <g id="tm-flip" style="transition: transform .7s ${EASE}; transform-origin: 100px 104px">
      <g id="tm-front">
        <rect x="40" y="56" width="120" height="96" rx="14" fill="url(#tm-cardA)" stroke="#27408B" stroke-width="1.8"/>
        <text x="100" y="94" text-anchor="middle" font-size="13" font-weight="900" fill="#27408B">2x − y + 1 = 0</text>
        <text x="100" y="126" text-anchor="middle" font-size="9.5" font-weight="800" fill="#5E77C4">일차방정식</text>
        <ellipse cx="60" cy="64" rx="11" ry="3" fill="#fff" opacity=".55"/>
      </g>
      <g id="tm-back" opacity="0">
        <rect x="40" y="56" width="120" height="96" rx="14" fill="url(#tm-cardB)" stroke="#065F46" stroke-width="1.8"/>
        <text x="100" y="94" text-anchor="middle" font-size="13" font-weight="900" fill="#065F46">y = 2x + 1</text>
        <text x="100" y="126" text-anchor="middle" font-size="9.5" font-weight="800" fill="#0A8F67">일차함수</text>
        <ellipse cx="60" cy="64" rx="11" ry="3" fill="#fff" opacity=".55"/>
      </g>
    </g>
    <g>
      <line x1="204" y1="160" x2="340" y2="160" stroke="#5E6C78" stroke-width="1.7"/>
      <line x1="216" y1="170" x2="216" y2="38" stroke="#5E6C78" stroke-width="1.7"/>
      <path id="tm-line" d="M204 168 L330 46" stroke="url(#tm-gl)" stroke-width="3.6" stroke-linecap="round" stroke-dasharray="176" stroke-dashoffset="176" style="transition: stroke-dashoffset 1.4s ${EASE}"/>
      <text x="318" y="176" font-size="10" font-weight="800" font-style="italic" fill="#475569">x</text>
      <text x="224" y="44" font-size="10" font-weight="800" font-style="italic" fill="#475569">y</text>
    </g>`,
    `${BG}
    <linearGradient id="tm-cardA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2F5FE"/><stop offset=".55" stop-color="#DDE6FB"/><stop offset="1" stop-color="#C3D2F4"/></linearGradient>
    <linearGradient id="tm-cardB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EFFCF6"/><stop offset=".55" stop-color="#D5F3E6"/><stop offset="1" stop-color="#B4E6D0"/></linearGradient>
    <linearGradient id="tm-gl" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#27408B"/><stop offset="1" stop-color="#0CA678"/></linearGradient>`,
  );
  const btn = mkBtn("카드 뒤집기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML =
    "파란 카드에는 중2 Ⅱ에서 만난 <b>미지수가 2개인 일차방정식</b>이 적혀 있어요. 그런데 이 카드, 뒷면이 있대요.";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    const flip = q<SVGGElement>(fig, "#tm-flip");
    flip.style.transform = "scaleX(0)";
    window.setTimeout(() => {
      q<SVGGElement>(fig, "#tm-front").setAttribute("opacity", "0");
      q<SVGGElement>(fig, "#tm-back").setAttribute("opacity", "1");
      flip.style.transform = "scaleX(1)";
      haptic(HAPTIC.tap);
    }, 720);
    window.setTimeout(() => {
      q<SVGPathElement>(fig, "#tm-line").style.strokeDashoffset = "0";
    }, 1500);
    window.setTimeout(() => {
      face("surprised");
      helper.innerHTML =
        "앞면은 방정식 <b>2x−y+1=0</b>, 뒷면은 함수 <b>y=2x+1</b>. 각각의 그래프를 그리면 어떻게 될까요?";
      ask(box, helper, {
        choices: choices ?? [
          "완전히 같은 직선 하나가 나와요",
          "비슷하지만 서로 다른 두 직선이 나와요",
          "방정식은 점 몇 개, 함수만 직선이 돼요",
        ],
        good: "정답! 앞뒤가 같은 카드 한 장이듯, 두 식은 <b>같은 직선의 두 이름</b>이에요. 이항으로 y만 남기면 방정식이 함수로 변신하죠. 오늘 그 변신을 직접 봐요.",
        bad: "이항해 보면 2x−y+1=0은 정확히 y=2x+1이 돼요. 다른 식처럼 보여도 해의 점들이 완전히 같아서 그래프는 <b>단 하나의 직선</b>! 방정식과 함수는 같은 직선의 두 이름이에요.",
        onDone: finish,
      });
    }, 2300);
  });
};

/* 10 chase: 먼저 출발한 동생 추격전, 만나는 순간은 그래프의 교점(연립방정식의 해) */
export const renderChase: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  fig.innerHTML = wrapSvg(
    `${CARD}
    ${SHADOW(96, 186, 70, 0.1)}
    <rect x="24" y="160" width="316" height="10" rx="5" fill="url(#ch-road)" stroke="#8C6A3A" stroke-width="1.2"/>
    <g id="ch-walk" style="transition: transform 2s linear">
      <circle cx="70" cy="136" r="8" fill="#FFFFFF" stroke="#1E2A38" stroke-width="1.8"/>
      <path d="M70 144 v14 M70 150 l-7 7 M70 150 l7 7 M70 147 l-6 4 M70 147 l6 4" stroke="#1E2A38" stroke-width="1.8" stroke-linecap="round"/>
    </g>
    <g id="ch-bike" style="transition: transform 2s ${EASE}">
      <circle cx="34" cy="152" r="8.5" fill="none" stroke="#0A6B4E" stroke-width="2.2"/>
      <circle cx="56" cy="152" r="8.5" fill="none" stroke="#0A6B4E" stroke-width="2.2"/>
      <path d="M34 152 L45 138 L56 152 M45 138 L52 136 M40 138 h9" stroke="#0CA678" stroke-width="2.4" stroke-linecap="round" fill="none"/>
      <circle cx="46" cy="126" r="7" fill="#FFFFFF" stroke="#1E2A38" stroke-width="1.7"/>
      <path d="M46 133 l-3 8 M46 133 l5 7" stroke="#1E2A38" stroke-width="1.7" stroke-linecap="round"/>
    </g>
    <g>
      <line x1="196" y1="112" x2="338" y2="112" stroke="#5E6C78" stroke-width="1.6"/>
      <line x1="202" y1="118" x2="202" y2="20" stroke="#5E6C78" stroke-width="1.6"/>
      <text x="326" y="124" font-size="8.5" font-weight="800" fill="#64748B">시간</text>
      <text x="208" y="26" font-size="8.5" font-weight="800" fill="#64748B">거리</text>
      <path id="ch-lineW" d="M202 76 L330 44" stroke="url(#ch-gw)" stroke-width="3.2" stroke-linecap="round" stroke-dasharray="134" stroke-dashoffset="134" style="transition: stroke-dashoffset 1.9s linear"/>
      <path id="ch-lineB" d="M202 112 L330 32" stroke="url(#ch-gb)" stroke-width="3.2" stroke-linecap="round" stroke-dasharray="152" stroke-dashoffset="152" style="transition: stroke-dashoffset 1.9s ${EASE}"/>
      <g id="ch-meet" style="opacity:0; transition: opacity .5s, transform .5s ${SPRING}; transform: scale(.4); transform-origin: 288px 54px">
        <circle cx="288" cy="54" r="8" fill="none" stroke="#E8A93E" stroke-width="2.6"/>
        <circle cx="288" cy="54" r="3" fill="#E8A93E"/>
      </g>
    </g>`,
    `${BG}
    <linearGradient id="ch-road" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E8D9BC"/><stop offset="1" stop-color="#C9B084"/></linearGradient>
    <linearGradient id="ch-gw" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#8C6A3A"/><stop offset="1" stop-color="#C9A96A"/></linearGradient>
    <linearGradient id="ch-gb" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#0A8F67"/><stop offset="1" stop-color="#4ECBA0"/></linearGradient>`,
  );
  const btn = mkBtn("추격 시작!");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML =
    "동생이 <b>먼저 걸어서</b> 출발했어요. 뒤늦게 눈치챈 내가 <b>자전거</b>로 쫓아갑니다. 거리-시간 그래프로 지켜봐요!";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    q<SVGGElement>(fig, "#ch-walk").style.transform = "translateX(180px)";
    q<SVGGElement>(fig, "#ch-bike").style.transform = "translateX(238px)";
    q<SVGPathElement>(fig, "#ch-lineW").style.strokeDashoffset = "0";
    q<SVGPathElement>(fig, "#ch-lineB").style.strokeDashoffset = "0";
    window.setTimeout(() => {
      const meet = q<SVGGElement>(fig, "#ch-meet");
      meet.style.opacity = "1";
      meet.style.transform = "scale(1)";
      haptic(HAPTIC.correct);
    }, 1750);
    window.setTimeout(() => {
      face("surprised");
      helper.innerHTML =
        "따라잡았다! 그래프에서 <b>따라잡는 바로 그 순간</b>은 어디에 나타날까요?";
      ask(box, helper, {
        choices: choices ?? [
          "두 그래프가 만나는 점이요",
          "초록 그래프가 갈색보다 높아지는 구간 전체요",
          "그래프의 맨 오른쪽 끝이요",
        ],
        good: "명중! 만나는 점에서는 두 사람의 시간도 거리도 완전히 같아요. 그래서 <b>교점 = 두 조건을 동시에 만족하는 해</b>. 연립방정식이 그래프와 만나는 순간이에요!",
        bad: "높아지는 '구간'은 이미 앞선 뒤의 이야기고, 끝점은 그냥 관찰을 멈춘 곳이에요. 따라잡는 순간은 시간도 거리도 똑같아지는 <b>단 한 점</b>, 두 그래프의 교점! 그 점의 정체를 오늘 밝혀요.",
        onDone: finish,
      });
    }, 2450);
  });
};
