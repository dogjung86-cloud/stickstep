// hookM2u4, 중2 수학 Ⅳ(삼각형과 사각형의 성질) 훅 장면 10종. hookMath.ts의 mathHook이 디스패치한다.
// 장면 계약: (scene, helper, finish, face, choices?), 공용 hookAsk.ask()만 사용,
// choices[0]=정답, good≠bad(오개념 교정), 소재명·설정은 도입(helper/narrator)에서 소개.
// 조작 먼저 → 예측 나중. 상태 변화는 인라인 스타일 트랜지션 + setTimeout(rAF 금지).
// SVG 파운드리 문법: 3스톱 그라데이션 면 + 좌상단 키라이트 + 접촉 그림자(#2A3A5E) + 재질별 최암색 외곽선.
// 수학 UI 텍스트 em대시 금지(−와 혼동), 제목류는 콜론·본문은 쉼표.
// 장면: hanger·foldstrip·phonestand·fairspot·cookiecut·cardspin·chopstick·bookshelf·pickrect·bentfence
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

/* 배경 카드 그라데이션(장면 공용), 블루프린트 크림 톤(단원 액센트 #1971C2 계열) */
const BG = `<linearGradient id="h4-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F3F9FE"/><stop offset=".55" stop-color="#E6F0FA"/><stop offset="1" stop-color="#D6E7F6"/></linearGradient>`;
const CARD = `<rect x="10" y="8" width="340" height="184" rx="16" fill="url(#h4-bg)"/>`;
const SPRING = "var(--spring, cubic-bezier(.34,1.35,.5,1))";
const EASE = "cubic-bezier(.22,1,.36,1)";

/* 1 hanger: 옷걸이 두 어깨, 이등변삼각형의 밑각(같은 기울기라 옷이 안 쏠린다) */
export const renderHanger: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  fig.innerHTML = wrapSvg(
    `${CARD}
    <rect x="30" y="22" width="300" height="8" rx="4" fill="url(#hg4-rod)" stroke="#5A4A38" stroke-width="1.3"/>
    ${SHADOW(180, 182, 86, 0.1)}
    <g id="hg4-hanger" style="transform-box: view-box; transform-origin:180px 30px; transition: transform .6s ${SPRING}">
      <path d="M180 34 q7 0 7 6 q0 5 -5 6" fill="none" stroke="#6E7C8C" stroke-width="2.6" stroke-linecap="round"/>
      <circle cx="180" cy="49" r="3" fill="url(#hg4-knob)" stroke="#0F4674" stroke-width="1.2"/>
      <path d="M180 50 L84 108 L276 108 Z" fill="url(#hg4-tri)" stroke="#0F4674" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M96 108 q84 16 168 0" fill="none" stroke="#0F4674" stroke-width="2.2" opacity=".0"/>
      <ellipse cx="140" cy="76" rx="12" ry="4" fill="#fff" opacity=".4" transform="rotate(-31 140 76)"/>
    </g>
    <g id="hg4-shirt" style="opacity:0; transform: translateY(-14px); transition: opacity .5s, transform .6s ${SPRING}">
      <path d="M180 52 L106 96 L106 122 L128 116 L128 168 q52 12 104 0 L232 116 L254 122 L254 96 Z" fill="url(#hg4-cloth)" stroke="#9C4F16" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M166 54 q14 10 28 0 l-8 20 h-12 z" fill="#C05F1D" opacity=".5"/>
      <ellipse cx="140" cy="88" rx="14" ry="5" fill="#fff" opacity=".3" transform="rotate(-24 140 88)"/>
    </g>
    <g id="hg4-arcs" style="opacity:0; transition: opacity .55s">
      <path d="M108 93.5 A28 28 0 0 1 111 108" stroke="#E8A93E" stroke-width="3" stroke-linecap="round"/>
      <path d="M252 93.5 A28 28 0 0 0 249 108" stroke="#E8A93E" stroke-width="3" stroke-linecap="round"/>
      <circle cx="84" cy="108" r="4" fill="#E8A93E"/>
      <circle cx="276" cy="108" r="4" fill="#E8A93E"/>
    </g>`,
    `${BG}
    <linearGradient id="hg4-rod" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9A87C"/><stop offset="1" stop-color="#8A6A44"/></linearGradient>
    <linearGradient id="hg4-tri" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5CA4E8"/><stop offset=".55" stop-color="#1971C2"/><stop offset="1" stop-color="#12579B"/></linearGradient>
    <radialGradient id="hg4-knob" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#A9CDF2"/><stop offset="1" stop-color="#4C90D6"/></radialGradient>
    <linearGradient id="hg4-cloth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFC98A"/><stop offset=".5" stop-color="#F0A24B"/><stop offset="1" stop-color="#D97F26"/></linearGradient>`,
  );
  const btn = mkBtn("옷 걸어 보기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "옷걸이는 두 어깨의 길이가 같은 <b>이등변삼각형</b> 모양이에요. 셔츠를 걸어 볼까요?";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    const shirt = q<SVGGElement>(fig, "#hg4-shirt");
    shirt.style.opacity = "1";
    shirt.style.transform = "translateY(0)";
    window.setTimeout(() => {
      const hang = q<SVGGElement>(fig, "#hg4-hanger");
      hang.style.transform = "rotate(2.5deg)";
      window.setTimeout(() => { hang.style.transform = "rotate(0deg)"; }, 380);
      haptic(HAPTIC.tap);
    }, 700);
    window.setTimeout(() => {
      q<SVGGElement>(fig, "#hg4-arcs").style.opacity = "1";
      face("curious");
      helper.innerHTML = "옷이 어느 쪽으로도 안 쏠려요. 두 어깨가 바닥과 이루는 <b>밑각 두 개</b>(주황 표시), 어떤 관계일까요?";
      ask(box, helper, {
        choices: choices ?? [
          "완전히 같아요, 두 어깨의 길이가 같은 삼각형이니까요",
          "고리가 달린 왼쪽이 아주 조금 더 커요",
          "옷걸이 모양마다 달라서 알 수 없어요",
        ],
        good: "맞아요! 두 변의 길이가 같으면 두 밑각도 같아요. 그런데 '같아 보인다'와 '항상 같다'는 다른 말이죠. 오늘은 이걸 단번에 밝히는 <b>증명</b>이라는 무기를 손에 넣어요.",
        bad: "실험해 보면 옷은 어느 쪽으로도 쏠리지 않아요. 두 어깨의 길이가 같으면 두 밑각의 크기도 같기 때문이죠. 그런데 세상 모든 이등변삼각형에서 그럴까요? 이걸 단번에 밝히는 무기가 오늘의 주인공이에요.",
        onDone: finish,
      });
    }, 1500);
  });
};

/* 2 foldstrip: 종이 띠를 비스듬히 접으면 겹침 삼각형이 늘 이등변(되는 조건의 예고) */
export const renderFoldstrip: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  // 띠(y 84~132) 위에 접힘 결과를 두 가지 각도로 미리 그려 두고 크로스페이드
  const foldScene = (id: string, x0: number, spread: number, hidden: boolean): string => {
    // 접선 x0에서 시작하는 겹침 삼각형(밑변 spread, 띠 폭 48 고정)
    const x1 = x0 + spread;
    return `<g id="${id}" style="opacity:${hidden ? 0 : 1}; transition: opacity .55s">
      <path d="M${x0} 132 L${x1} 132 L${x0 + spread / 2} 132 Z" fill="none"/>
      <path d="M${x0} 84 L${x0} 132 L${x1} 132 Z" fill="url(#fs4-fold)" stroke="#0F4674" stroke-width="1.8" stroke-linejoin="round" opacity=".92"/>
      <path d="M${x0} 84 L${x1} 132" stroke="#0F4674" stroke-width="1.4" stroke-dasharray="4 3" opacity=".55"/>
      <path d="M${x0} 118 A14 14 0 0 1 ${x0 + 11.2} 122.6" stroke="#E8A93E" stroke-width="2.6" stroke-linecap="round" fill="none"/>
      <path d="M${x1 - 13} 132 A13 13 0 0 1 ${x1 - 2.4} 124.4" stroke="#E8A93E" stroke-width="2.6" stroke-linecap="round" fill="none"/>
    </g>`;
  };
  fig.innerHTML = wrapSvg(
    `${CARD}
    ${SHADOW(180, 168, 110, 0.1)}
    <rect x="28" y="84" width="304" height="48" rx="6" fill="url(#fs4-strip)" stroke="#B8925C" stroke-width="1.6"/>
    <rect x="28" y="88" width="304" height="7" fill="#fff" opacity=".35"/>
    ${foldScene("fs4-a", 118, 76, true)}
    ${foldScene("fs4-b", 150, 116, true)}
    <g id="fs4-tag" style="opacity:0; transition: opacity .5s">
      <rect x="236" y="40" width="96" height="30" rx="10" fill="#FFFFFF" stroke="#C8D8E8" stroke-width="1.4"/>
      <text x="284" y="59" text-anchor="middle" font-size="12" font-weight="900" fill="#12579B">두 각이 같다!</text>
    </g>`,
    `${BG}
    <linearGradient id="fs4-strip" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FCEFD8"/><stop offset=".5" stop-color="#F2DDB4"/><stop offset="1" stop-color="#E3C68E"/></linearGradient>
    <linearGradient id="fs4-fold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#A9CDF2"/><stop offset=".55" stop-color="#5CA4E8"/><stop offset="1" stop-color="#2B79C0"/></linearGradient>`,
  );
  const btn = mkBtn("비스듬히 접기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "긴 <b>종이 띠</b>가 있어요. 버튼을 눌러 비스듬히 접으면 겹치는 부분에 삼각형이 생겨요.";

  let stage = 0;
  btn.addEventListener("click", () => {
    haptic(HAPTIC.select);
    if (stage === 0) {
      stage = 1;
      q<SVGGElement>(fig, "#fs4-a").style.opacity = "1";
      window.setTimeout(() => { q<SVGGElement>(fig, "#fs4-tag").style.opacity = "1"; }, 550);
      btn.querySelector("span")!.textContent = "다른 각도로 접기";
      helper.innerHTML = "겹침 삼각형이 나왔어요! 아래 두 각(주황)이 <b>같은 크기</b>로 보이죠? 이번엔 <b>다른 각도</b>로 접어 봐요.";
      return;
    }
    if (stage === 1) {
      stage = 2;
      btn.disabled = true;
      btn.classList.remove("pulse");
      q<SVGGElement>(fig, "#fs4-a").style.opacity = "0";
      window.setTimeout(() => { q<SVGGElement>(fig, "#fs4-b").style.opacity = "1"; haptic(HAPTIC.tap); }, 420);
      window.setTimeout(() => {
        face("surprised");
        helper.innerHTML = "각도를 바꿔 접어도 아래 두 각은 또 같아 보여요. 그렇다면 이 겹침 삼각형의 <b>두 변</b>은 어떨까요?";
        ask(box, helper, {
          choices: choices ?? [
            "두 변의 길이도 같은 이등변삼각형이에요, 어떻게 접어도요",
            "변의 길이는 접는 각도마다 제각각이에요",
            "밑변보다 긴 변은 절대 안 생겨요",
          ],
          good: "정답! 아무렇게나 접어도 늘 이등변이에요. 비밀은 방금 본 '같은 두 각'에 있어요. 두 각이 같으면 두 변도 같아진다는 것, 지난 시간의 거꾸로 방향이죠. 직접 만들어 확인해 봐요!",
          bad: "신기하게도 어떤 각도로 접든 두 변의 길이가 같은 이등변삼각형이 나와요. 비밀은 '같은 두 각'이에요. 각이 같으면 변도 같아진다니, 지난 시간과 방향이 거꾸로죠? 실험으로 확인해 봐요!",
          onDone: finish,
        });
      }, 1150);
    }
  });
};

/* 3 phonestand: 접이식 폰 거치대 두 대, 다리(빗변) 길이 + 세운 각도가 같으면 자세가 통째로 같다 */
export const renderPhonestand: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  const stand = (ox: number, id: string, tone: "a" | "b"): string =>
    `<g id="${id}">
      ${SHADOW(ox + 52, 166, 52, 0.12)}
      <rect x="${ox}" y="158" width="104" height="8" rx="4" fill="url(#ps4-base${tone})" stroke="#0F4674" stroke-width="1.5"/>
      <g id="${id}-leg" style="transform-box: view-box; transform-origin:${ox + 92}px 160px; transform: rotate(64deg); transition: transform .8s ${SPRING}">
        <rect x="${ox + 24}" y="156" width="70" height="7" rx="3.5" fill="url(#ps4-leg${tone})" stroke="#0F4674" stroke-width="1.4"/>
      </g>
      <g id="${id}-phone" style="opacity:0; transition: opacity .5s .55s">
        <rect x="${ox + 18}" y="98" width="44" height="66" rx="7" fill="url(#ps4-ph${tone})" stroke="#1E2A38" stroke-width="1.6" transform="rotate(-18 ${ox + 40} 131)"/>
        <rect x="${ox + 24}" y="106" width="30" height="48" rx="3" fill="#DFF0FF" opacity=".8" transform="rotate(-18 ${ox + 40} 131)"/>
      </g>
      <path id="${id}-arc" d="M${ox + 66} 160 A26 26 0 0 0 ${ox + 80.6} 137.4" stroke="#E8A93E" stroke-width="2.6" fill="none" stroke-linecap="round" opacity="0" style="transition: opacity .5s .3s"/>
    </g>`;
  fig.innerHTML = wrapSvg(
    `${CARD}
    <text x="66" y="34" font-size="11.5" font-weight="800" fill="#5A6B7E">내 거치대</text>
    <text x="238" y="34" font-size="11.5" font-weight="800" fill="#5A6B7E">친구 거치대</text>
    ${stand(30, "ps4-L", "a")}
    ${stand(206, "ps4-R", "b")}
    <g id="ps4-same" style="opacity:0; transition: opacity .5s">
      <rect x="118" y="44" width="124" height="30" rx="10" fill="#FFFFFF" stroke="#C8D8E8" stroke-width="1.4"/>
      <text x="180" y="63" text-anchor="middle" font-size="12" font-weight="900" fill="#12579B">높이까지 똑같다!</text>
    </g>`,
    `${BG}
    <linearGradient id="ps4-basea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5CA4E8"/><stop offset="1" stop-color="#1E6AB2"/></linearGradient>
    <linearGradient id="ps4-baseb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8FBFEF"/><stop offset="1" stop-color="#3C86CC"/></linearGradient>
    <linearGradient id="ps4-lega" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B9D7F4"/><stop offset="1" stop-color="#5795D2"/></linearGradient>
    <linearGradient id="ps4-legb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#CDE2F7"/><stop offset="1" stop-color="#74A9DE"/></linearGradient>
    <linearGradient id="ps4-pha" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4A5A6C"/><stop offset="1" stop-color="#26313E"/></linearGradient>
    <linearGradient id="ps4-phb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5A6A7C"/><stop offset="1" stop-color="#303B48"/></linearGradient>`,
  );
  const btn = mkBtn("둘 다 펴기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "책상 위 접이식 <b>폰 거치대</b> 두 대예요. 다리 길이가 같고, 세울 각도도 <b>같은 눈금</b>에 맞출 거예요. 펴 볼까요?";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    for (const id of ["ps4-L", "ps4-R"]) {
      q<SVGGElement>(fig, `#${id}-leg`).style.transform = "rotate(38deg)";
      window.setTimeout(() => { q<SVGGElement>(fig, `#${id}-phone`).style.opacity = "1"; }, 620);
      window.setTimeout(() => { q<SVGPathElement>(fig, `#${id}-arc`).style.opacity = "1"; }, 350);
    }
    window.setTimeout(() => { q<SVGGElement>(fig, "#ps4-same").style.opacity = "1"; haptic(HAPTIC.tap); }, 1250);
    window.setTimeout(() => {
      face("curious");
      helper.innerHTML = "다리(가장 긴 변)의 길이가 같고 세운 각도가 같았을 뿐인데, 폰이 놓인 높이까지 똑같아요. 두 거치대가 만드는 직각삼각형의 <b>모양 전체</b>는 어떨까요?";
      ask(box, helper, {
        choices: choices ?? [
          "완전히 똑같아요, 정보 두 개로 나머지가 다 정해졌거든요",
          "높이만 같고 바닥에 닿는 폭은 다를 수 있어요",
          "실제로 포개 봐야만 알 수 있어요",
        ],
        good: "정확해요! 직각은 이미 정해져 있으니, 가장 긴 변과 각도 하나면 삼각형이 통째로 결정돼요. 일반 삼각형은 정보가 3개 필요했는데 직각삼각형은 2개로 끝! 이 지름길을 복제 공방에서 확인해요.",
        bad: "바닥 폭도, 높이도, 전부 똑같아져요. 직각이 이미 정보 하나를 차지하고 있어서, 가장 긴 변+각도 하나면 삼각형의 모든 것이 정해지거든요. 정보 2개면 충분한 이 지름길을 공방에서 확인해요!",
        onDone: finish,
      });
    }, 2050);
  });
};

/* 4 fairspot: 세 친구 집에서 같은 거리인 약속 장소(외심의 씨앗) */
export const renderFairspot: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  const house = (x: number, y: number, hue: string, dark: string, name: string): string =>
    `<g>
      ${SHADOW(x, y + 20, 16, 0.12)}
      <rect x="${x - 12}" y="${y - 2}" width="24" height="20" rx="3" fill="url(#${hue})" stroke="${dark}" stroke-width="1.5"/>
      <path d="M${x - 16} ${y} L${x} ${y - 14} L${x + 16} ${y} Z" fill="url(#fp4-roof)" stroke="#8C3A2A" stroke-width="1.5" stroke-linejoin="round"/>
      <rect x="${x - 4}" y="${y + 8}" width="8" height="10" rx="1.5" fill="#5A3A22"/>
      <text x="${x}" y="${y + 34}" text-anchor="middle" font-size="10.5" font-weight="800" fill="#5A6B7E">${name}</text>
    </g>`;
  // 세 집: A(70,58) B(96,150) C(292,120), "가운데쯤" 핀 = 평균점(152.7, 109.3) → 실제 등거리점과 다름
  fig.innerHTML = wrapSvg(
    `${CARD}
    <path d="M30 178 q60 -26 118 -8 q76 24 182 -14" stroke="#C9D9E8" stroke-width="10" fill="none" stroke-linecap="round" opacity=".7"/>
    <path d="M52 16 q40 30 30 62 q-8 26 22 44" stroke="#C9D9E8" stroke-width="8" fill="none" stroke-linecap="round" opacity=".55"/>
    ${house(70, 58, "fp4-h1", "#0F4674", "지우네")}
    ${house(96, 150, "fp4-h2", "#5A6B14", "하람이네")}
    ${house(292, 120, "fp4-h3", "#7A3A8C", "도윤이네")}
    <g id="fp4-pin" style="opacity:0; transform: translateY(-10px); transition: opacity .45s, transform .55s ${SPRING}">
      <path d="M153 96 q9 0 9 9 q0 7 -9 17 q-9 -10 -9 -17 q0 -9 9 -9 z" fill="url(#fp4-pinG)" stroke="#8C1D33" stroke-width="1.5"/>
      <circle cx="153" cy="105" r="3.4" fill="#FFE1E8"/>
    </g>
    <g id="fp4-dists" style="opacity:0; transition: opacity .55s">
      <line x1="76" y1="66" x2="150" y2="100" stroke="#1971C2" stroke-width="2" stroke-dasharray="5 4"/>
      <line x1="102" y1="144" x2="150" y2="112" stroke="#1971C2" stroke-width="2" stroke-dasharray="5 4"/>
      <line x1="284" y1="118" x2="158" y2="106" stroke="#E8547E" stroke-width="2.4" stroke-dasharray="5 4"/>
      <rect x="88" y="72" width="44" height="20" rx="7" fill="#fff" stroke="#C8D8E8" stroke-width="1.2"/>
      <text x="110" y="86" text-anchor="middle" font-size="10.5" font-weight="900" fill="#12579B">9분</text>
      <rect x="106" y="122" width="44" height="20" rx="7" fill="#fff" stroke="#C8D8E8" stroke-width="1.2"/>
      <text x="128" y="136" text-anchor="middle" font-size="10.5" font-weight="900" fill="#12579B">7분</text>
      <rect x="196" y="90" width="52" height="20" rx="7" fill="#fff" stroke="#F2B7C6" stroke-width="1.2"/>
      <text x="222" y="104" text-anchor="middle" font-size="10.5" font-weight="900" fill="#C2255C">15분!</text>
    </g>`,
    `${BG}
    <linearGradient id="fp4-h1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A9CDF2"/><stop offset="1" stop-color="#5795D2"/></linearGradient>
    <linearGradient id="fp4-h2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D8E8A0"/><stop offset="1" stop-color="#9CB438"/></linearGradient>
    <linearGradient id="fp4-h3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E4C2F0"/><stop offset="1" stop-color="#B36CCB"/></linearGradient>
    <linearGradient id="fp4-roof" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2967E"/><stop offset="1" stop-color="#C1533A"/></linearGradient>
    <radialGradient id="fp4-pinG" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#F98CA6"/><stop offset="1" stop-color="#D0345A"/></radialGradient>`,
  );
  const btn = mkBtn("가운데쯤 핀 꽂기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "세 친구가 약속 장소를 정해요. 조건은 단 하나, <b>세 집에서 걸리는 시간이 똑같을 것</b>! 일단 눈대중으로 가운데쯤에 핀을 꽂아 볼까요?";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    const pin = q<SVGGElement>(fig, "#fp4-pin");
    pin.style.opacity = "1";
    pin.style.transform = "translateY(0)";
    window.setTimeout(() => { q<SVGGElement>(fig, "#fp4-dists").style.opacity = "1"; haptic(HAPTIC.tap); }, 700);
    window.setTimeout(() => {
      face("surprised");
      helper.innerHTML = "이런, 도윤이네만 15분이에요. 눈대중 가운데는 공평하지 않네요. 그럼 <b>세 집에서 정말 같은 거리인 지점</b>은 어떨까요?";
      ask(box, helper, {
        choices: choices ?? [
          "딱 한 점 있어요, 특별한 선들이 만나는 자리래요",
          "그런 점은 없어요, 어느 한 집은 꼭 더 가까워요",
          "가운데 근처라면 어디든 대충 공평해요",
        ],
        good: "맞아요, 단 한 점 존재해요! 그 점을 찾는 열쇠가 중1에서 배운 <b>수직이등분선</b>이라는 게 오늘의 반전이죠. 수색 작전으로 직접 찾아봐요.",
        bad: "사실 세 집에서 정확히 같은 거리인 점이 <b>딱 하나</b> 있어요. 방금 봤듯 눈대중으로는 못 찾고, 특별한 선들의 교차점으로만 잡을 수 있죠. 수색 작전으로 직접 찾아봐요!",
        onDone: finish,
      });
    }, 1600);
  });
};

/* 5 cookiecut: 삼각형 반죽에서 가장 큰 원형 쿠키(내접원의 씨앗) */
export const renderCookiecut: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  fig.innerHTML = wrapSvg(
    `${CARD}
    ${SHADOW(180, 176, 104, 0.1)}
    <path d="M76 168 L182 34 L308 160 Z" fill="url(#ck4-dough)" stroke="#B8925C" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M96 160 L182 52" stroke="#fff" stroke-width="5" opacity=".25" stroke-linecap="round"/>
    <g id="ck4-c1" style="opacity:0; transition: opacity .5s">
      <circle cx="110" cy="146" r="17" fill="url(#ck4-cut)" stroke="#9C6A2E" stroke-width="1.8" stroke-dasharray="4 3"/>
      <text x="110" y="126" text-anchor="middle" font-size="10.5" font-weight="800" fill="#8C5A1E">작다…</text>
    </g>
    <g id="ck4-c2" style="opacity:0; transition: opacity .5s">
      <circle cx="196" cy="122" r="30" fill="url(#ck4-cut)" stroke="#9C6A2E" stroke-width="1.8" stroke-dasharray="4 3"/>
      <text x="196" y="86" text-anchor="middle" font-size="10.5" font-weight="800" fill="#8C5A1E">좀 낫네?</text>
    </g>
    <g id="ck4-q" style="opacity:0; transition: opacity .5s">
      <text x="181" y="150" text-anchor="middle" font-size="17" font-weight="900" fill="#C2255C">최대는 어디?</text>
    </g>`,
    `${BG}
    <linearGradient id="ck4-dough" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FCEBCB"/><stop offset=".5" stop-color="#F2D8A4"/><stop offset="1" stop-color="#E0BE7E"/></linearGradient>
    <radialGradient id="ck4-cut" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#FCE3B8"/><stop offset="1" stop-color="#E8B96A"/></radialGradient>`,
  );
  const btn = mkBtn("구석에 찍어 보기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "쿠키를 오리고 남은 <b>삼각형 반죽</b>이에요. 여기서 <b>가장 큰 원형 쿠키</b> 하나를 더 찍고 싶어요. 커터를 눌러 볼까요?";

  let stage = 0;
  btn.addEventListener("click", () => {
    haptic(HAPTIC.select);
    if (stage === 0) {
      stage = 1;
      q<SVGGElement>(fig, "#ck4-c1").style.opacity = "1";
      btn.querySelector("span")!.textContent = "가운데쯤 찍어 보기";
      helper.innerHTML = "구석은 좁아서 <b>작은 쿠키</b>밖에 안 나와요. 좀 더 안쪽은 어떨까요?";
      return;
    }
    stage = 2;
    btn.disabled = true;
    btn.classList.remove("pulse");
    q<SVGGElement>(fig, "#ck4-c2").style.opacity = "1";
    window.setTimeout(() => { q<SVGGElement>(fig, "#ck4-q").style.opacity = "1"; haptic(HAPTIC.tap); }, 650);
    window.setTimeout(() => {
      face("curious");
      helper.innerHTML = "커졌지만 아직 변까지 여유가 있어요. <b>가장 큰 원</b>이 되는 자리는 어떻게 찾을까요?";
      ask(box, helper, {
        choices: choices ?? [
          "세 변에서 똑같이 떨어진 딱 한 점을 찾으면 돼요",
          "세 꼭짓점에서 같은 거리인 점을 찾으면 돼요",
          "제일 넓어 보이는 곳에 감으로 찍는 수밖에 없어요",
        ],
        good: "정확해요! 가장 큰 원은 세 변에 <b>동시에 닿는</b> 원이고, 그 중심은 세 변에서 같은 거리인 단 한 점이에요. 지난 시간의 점(꼭짓점에서 같은 거리)과 헷갈리기 쉬운 쌍둥이 문제죠. 공방에서 직접 찾아요!",
        bad: "꼭짓점 기준은 지난 시간의 점(바깥 원의 중심)이고, 감으로는 방금처럼 늘 아쉬워요. 가장 큰 쿠키의 중심은 <b>세 변에서 같은 거리</b>인 단 한 점이랍니다. 공방에서 직접 찾아봐요!",
        onDone: finish,
      });
    }, 1450);
  });
};

/* 6 cardspin: 그림 카드는 거꾸로 잡아도 똑같다(반 바퀴 회전 대칭 → 평행사변형의 심장) */
export const renderCardspin: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  // 카드 속 그림: 위아래로 마주 보는 추상 왕관 문양(180° 회전 대칭이 되도록 상하 쌍둥이 배치, 글자 없음)
  const crest = (cx: number, cy: number, flip: boolean): string =>
    `<g transform="translate(${cx} ${cy})${flip ? " rotate(180)" : ""}">
      <path d="M-16 10 L-10 -6 L0 4 L10 -6 L16 10 Z" fill="url(#cs4-crest)" stroke="#8C6A1E" stroke-width="1.4" stroke-linejoin="round"/>
      <circle cx="0" cy="-12" r="4" fill="url(#cs4-gem)" stroke="#8C1D33" stroke-width="1.2"/>
    </g>`;
  fig.innerHTML = wrapSvg(
    `${CARD}
    ${SHADOW(120, 178, 44, 0.12)}${SHADOW(252, 178, 46, 0.12)}
    <g id="cs4-card" style="transform-box: view-box; transform-origin:120px 104px; transition: transform 1s ${EASE}">
      <rect x="78" y="30" width="84" height="148" rx="10" fill="url(#cs4-face)" stroke="#B8925C" stroke-width="2"/>
      <rect x="86" y="38" width="68" height="132" rx="6" fill="none" stroke="#D9BE8C" stroke-width="1.4"/>
      ${crest(120, 74, false)}
      ${crest(120, 134, true)}
      <ellipse cx="98" cy="46" rx="10" ry="4" fill="#fff" opacity=".5"/>
    </g>
    <g id="cs4-para" style="transform-box: view-box; transform-origin:252px 112px; transition: transform 1s ${EASE}">
      <path d="M216 146 L240 78 L288 78 L264 146 Z" fill="url(#cs4-pgram)" stroke="#0F4674" stroke-width="2.2" stroke-linejoin="round"/>
      <ellipse cx="240" cy="92" rx="10" ry="4" fill="#fff" opacity=".4" transform="rotate(-18 240 92)"/>
    </g>
    <text x="120" y="24" text-anchor="middle" font-size="11.5" font-weight="800" fill="#5A6B7E">그림 카드</text>
    <text x="252" y="24" text-anchor="middle" font-size="11.5" font-weight="800" fill="#5A6B7E">평행사변형</text>`,
    `${BG}
    <linearGradient id="cs4-face" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFDF6"/><stop offset=".6" stop-color="#F8EFDC"/><stop offset="1" stop-color="#EDDDBC"/></linearGradient>
    <linearGradient id="cs4-crest" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFD98A"/><stop offset="1" stop-color="#D9A32E"/></linearGradient>
    <radialGradient id="cs4-gem" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#F98CA6"/><stop offset="1" stop-color="#C2255C"/></radialGradient>
    <linearGradient id="cs4-pgram" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5CA4E8"/><stop offset=".55" stop-color="#1971C2"/><stop offset="1" stop-color="#114E85"/></linearGradient>`,
  );
  const btn = mkBtn("반 바퀴 돌리기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "카드 게임의 <b>그림 카드</b>는 거꾸로 잡아도 똑같이 보이게 설계돼 있어요. 정말인지 카드를 반 바퀴 돌려 볼까요?";

  let spun = 0;
  btn.addEventListener("click", () => {
    haptic(HAPTIC.select);
    if (spun === 0) {
      spun = 1;
      q<SVGGElement>(fig, "#cs4-card").style.transform = "rotate(180deg)";
      btn.querySelector("span")!.textContent = "옆의 도형도 돌리기";
      window.setTimeout(() => {
        helper.innerHTML = "반 바퀴를 돌렸는데 <b>그대로예요!</b> 위아래 문양이 마주 보게 설계된 덕분이죠. 그럼 옆의 <b>평행사변형</b>도 돌려 볼까요?";
        haptic(HAPTIC.tap);
      }, 1050);
      return;
    }
    if (spun === 1) {
      spun = 2;
      btn.disabled = true;
      btn.classList.remove("pulse");
      q<SVGGElement>(fig, "#cs4-para").style.transform = "rotate(180deg)";
      window.setTimeout(() => {
        face("surprised");
        helper.innerHTML = "평행사변형도 반 바퀴 돌렸어요. 어떻게 보이나요?";
        ask(box, helper, {
          choices: choices ?? [
            "돌리기 전과 완전히 똑같아요, 카드처럼요",
            "좌우가 뒤집혀서 다른 모양이 됐어요",
            "기울기가 반대로 바뀌었어요",
          ],
          good: "맞아요! 평행사변형은 반 바퀴 돌리면 자기 자신과 정확히 포개져요. 이 한 가지 사실에서 성질 <b>세 개</b>가 우르르 쏟아진답니다. 회전 실험실에서 캐내 봐요!",
          bad: "다시 보면 돌리기 전과 완전히 같아요! 평행사변형은 반 바퀴 회전에 자기 자신과 포개지는 도형이거든요. 이 사실 하나에서 성질 세 개가 쏟아져요. 회전 실험실에서 확인!",
          onDone: finish,
        });
      }, 1150);
    }
  });
};

/* 7 chopstick: 어른 젓가락 한 쌍 + 아이 젓가락 한 쌍 = 눕혀도 평행이 안 깨지는 사각형 */
export const renderChopstick: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  // 사각형 프레임: 밑변(어른 젓가락) B(96,150)→C(268,150), 옆변(아이 젓가락) 길이 82
  // 처음 각도 76° → 밀면 52°로 기울어짐(꼭짓점 좌표는 JS에서 갱신)
  fig.innerHTML = wrapSvg(
    `${CARD}
    ${SHADOW(182, 168, 96, 0.11)}
    <g id="cp4-frame"></g>
    <g id="cp4-arrows" style="opacity:0; transition: opacity .5s"></g>
    <g id="cp4-hand" style="opacity:0; transition: opacity .4s, transform .8s ${EASE}">
      <path d="M318 96 q-10 4 -16 12 l10 6 q8 -8 14 -10 z" fill="url(#cp4-skin)" stroke="#B8823C" stroke-width="1.3"/>
    </g>`,
    `${BG}
    <linearGradient id="cp4-wood1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D9A96A"/><stop offset="1" stop-color="#A6763C"/></linearGradient>
    <linearGradient id="cp4-wood2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F0C88A"/><stop offset="1" stop-color="#C2924E"/></linearGradient>
    <radialGradient id="cp4-skin" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#FBD6A8"/><stop offset="1" stop-color="#E8AE6A"/></radialGradient>`,
  );
  const frame = q<SVGGElement>(fig, "#cp4-frame");
  const arrows = q<SVGGElement>(fig, "#cp4-arrows");
  const paint = (angDeg: number): void => {
    const B = { x: 106, y: 152 };
    const L = 168; // 어른 젓가락(밑변·윗변)
    const s = 78; // 아이 젓가락(옆변)
    const a = (angDeg * Math.PI) / 180;
    const A = { x: B.x + s * Math.cos(a), y: B.y - s * Math.sin(a) };
    const C = { x: B.x + L, y: B.y };
    const D = { x: A.x + L, y: A.y };
    const stick = (p: { x: number; y: number }, qq: { x: number; y: number }, grad: string): string =>
      `<line x1="${p.x}" y1="${p.y}" x2="${qq.x}" y2="${qq.y}" stroke="url(#${grad})" stroke-width="8" stroke-linecap="round"/>` +
      `<line x1="${p.x}" y1="${p.y}" x2="${qq.x}" y2="${qq.y}" stroke="#7A5220" stroke-width="8" stroke-linecap="round" opacity=".18" transform="translate(0 1.6)"/>`;
    frame.innerHTML =
      stick(B, C, "cp4-wood1") + stick(A, D, "cp4-wood1") + stick(B, A, "cp4-wood2") + stick(C, D, "cp4-wood2") +
      `<circle cx="${B.x}" cy="${B.y}" r="4" fill="#5A3A12"/><circle cx="${C.x}" cy="${C.y}" r="4" fill="#5A3A12"/>` +
      `<circle cx="${A.x}" cy="${A.y}" r="4" fill="#5A3A12"/><circle cx="${D.x}" cy="${D.y}" r="4" fill="#5A3A12"/>`;
    const mid = (p: { x: number; y: number }, qq: { x: number; y: number }, t: number) =>
      ({ x: p.x + (qq.x - p.x) * t, y: p.y + (qq.y - p.y) * t });
    const m1 = mid(B, C, 0.5);
    const m2 = mid(A, D, 0.5);
    arrows.innerHTML =
      `<path d="M${m1.x - 12} ${m1.y + 14} h24 l-6 -4 m6 4 l-6 4" stroke="#1971C2" stroke-width="2.2" fill="none" stroke-linecap="round"/>` +
      `<path d="M${m2.x - 12} ${m2.y - 12} h24 l-6 -4 m6 4 l-6 4" stroke="#1971C2" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
  };
  paint(76);
  const btn = mkBtn("옆으로 밀기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "어른 <b>젓가락 한 쌍</b>(마주 보게)과 아이 <b>젓가락 한 쌍</b>(마주 보게)을 이어 사각형을 만들었어요. 밀어서 눕혀 볼까요?";

  let stage = 0;
  btn.addEventListener("click", () => {
    haptic(HAPTIC.select);
    const hand = q<SVGGElement>(fig, "#cp4-hand");
    hand.style.opacity = "1";
    // 기울이기 트윈(setTimeout 체인)
    const from = stage === 0 ? 76 : 58;
    const to = stage === 0 ? 58 : 40;
    for (let i = 1; i <= 12; i++) {
      window.setTimeout(() => paint(from + ((to - from) * i) / 12), i * 34);
    }
    window.setTimeout(() => { arrows.style.opacity = "1"; }, 480);
    if (stage === 0) {
      stage = 1;
      btn.querySelector("span")!.textContent = "더 세게 밀기";
      window.setTimeout(() => {
        helper.innerHTML = "기울어졌는데도 마주 보는 변끼리는 여전히 <b>나란해</b> 보여요(파란 화살표). 더 세게 밀면요?";
      }, 800);
      return;
    }
    stage = 2;
    btn.disabled = true;
    btn.classList.remove("pulse");
    window.setTimeout(() => {
      face("curious");
      helper.innerHTML = "납작 눕혔는데도 화살표는 나란해요. 계속 밀어 더 납작하게 만들면 어떻게 될까요?";
      ask(box, helper, {
        choices: choices ?? [
          "아무리 눕혀도 마주 보는 두 쌍의 변은 평행을 지켜요",
          "어느 순간 평행이 깨지면서 찌그러진 사다리꼴이 돼요",
          "젓가락이 늘어나면서 사각형이 아니게 돼요",
        ],
        good: "정답! 마주 보는 변의 <b>길이가 각각 같다</b>는 조건만으로 평행이 저절로 보장돼요. 젓가락은 길이가 변하지 않으니까요. 이런 '평행사변형을 보장하는 조건'이 몇 개나 되는지, 감별소에서 검증해 봐요!",
        bad: "젓가락의 길이는 변하지 않죠. 그리고 신기하게도 '마주 보는 변의 길이가 각각 같다'는 조건만 지켜지면 평행은 절대 깨지지 않아요. 이런 보장 조건이 몇 개나 되는지 감별소에서 확인해 봐요!",
        onDone: finish,
      });
    }, 1100);
  });
};

/* 8 bookshelf: 조립 가구의 대각선 검사(두 대각선 길이가 같으면 직각 완성) */
export const renderBookshelf: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  fig.innerHTML = wrapSvg(
    `${CARD}
    ${SHADOW(140, 180, 80, 0.12)}
    <g id="bs4-frame" style="transform-box: view-box; transform-origin:140px 178px; transform: skewX(-7deg); transition: transform .9s ${SPRING}">
      <rect x="66" y="34" width="148" height="144" rx="6" fill="url(#bs4-wood)" stroke="#7A5220" stroke-width="2.4"/>
      <rect x="78" y="46" width="124" height="120" rx="3" fill="url(#bs4-in)" stroke="#8C6A3A" stroke-width="1.4"/>
      <line x1="78" y1="106" x2="202" y2="106" stroke="#8C6A3A" stroke-width="3"/>
      <line id="bs4-d1" x1="78" y1="46" x2="202" y2="166" stroke="#1971C2" stroke-width="0" stroke-dasharray="6 4"/>
      <line id="bs4-d2" x1="202" y1="46" x2="78" y2="166" stroke="#E8547E" stroke-width="0" stroke-dasharray="6 4"/>
      <ellipse cx="96" cy="52" rx="12" ry="4" fill="#fff" opacity=".35"/>
    </g>
    <g id="bs4-tags" style="opacity:0; transition: opacity .5s">
      <rect x="236" y="58" width="96" height="26" rx="9" fill="#fff" stroke="#BBD3EA" stroke-width="1.3"/>
      <text x="284" y="75" text-anchor="middle" font-size="11" font-weight="900" fill="#1971C2">파란 줄 91cm</text>
      <rect x="236" y="90" width="96" height="26" rx="9" fill="#fff" stroke="#F2B7C6" stroke-width="1.3"/>
      <text x="284" y="107" text-anchor="middle" font-size="11" font-weight="900" fill="#C2255C">분홍 줄 96cm</text>
    </g>
    <g id="bs4-ok" style="opacity:0; transition: opacity .5s">
      <rect x="236" y="90" width="96" height="26" rx="9" fill="#F0FBF5" stroke="#7ACB9E" stroke-width="1.3"/>
      <text x="284" y="107" text-anchor="middle" font-size="11" font-weight="900" fill="#1E7A31">둘 다 91cm!</text>
    </g>
    <path d="M240 150 q22 14 46 6" stroke="#94A3B8" stroke-width="2" stroke-dasharray="4 3" fill="none" id="bs4-pushArrow" style="opacity:0"/>`,
    `${BG}
    <linearGradient id="bs4-wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E8C088"/><stop offset=".5" stop-color="#CE9A54"/><stop offset="1" stop-color="#A9772F"/></linearGradient>
    <linearGradient id="bs4-in" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBF0DC"/><stop offset="1" stop-color="#EAD3A8"/></linearGradient>`,
  );
  const btn = mkBtn("대각선 두 줄 재기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "책장 조립 마지막 단계예요. 설명서의 지시가 특이해요. <b>\"두 대각선의 길이를 재서 같게 맞추세요.\"</b> 줄자를 대 볼까요?";

  let stage = 0;
  btn.addEventListener("click", () => {
    haptic(HAPTIC.select);
    if (stage === 0) {
      stage = 1;
      q<SVGLineElement>(fig, "#bs4-d1").style.strokeWidth = "3";
      window.setTimeout(() => { q<SVGLineElement>(fig, "#bs4-d2").style.strokeWidth = "3"; }, 400);
      window.setTimeout(() => { q<SVGGElement>(fig, "#bs4-tags").style.opacity = "1"; haptic(HAPTIC.tap); }, 850);
      btn.querySelector("span")!.textContent = "같아질 때까지 밀기";
      window.setTimeout(() => {
        helper.innerHTML = "길이가 <b>다르네요</b>(91 vs 96). 프레임이 삐딱하다는 뜻! 설명서대로 같아질 때까지 밀어 볼까요?";
      }, 1100);
      return;
    }
    stage = 2;
    btn.disabled = true;
    btn.classList.remove("pulse");
    q<SVGGElement>(fig, "#bs4-frame").style.transform = "skewX(0deg)";
    window.setTimeout(() => { q<SVGGElement>(fig, "#bs4-ok").style.opacity = "1"; haptic(HAPTIC.tap); }, 900);
    window.setTimeout(() => {
      face("surprised");
      helper.innerHTML = "두 대각선이 같아지는 순간 프레임이 반듯해졌어요! 각도기는 대지도 않았는데요. <b>대각선의 길이가 같다</b>는 건 무슨 신호일까요?";
      ask(box, helper, {
        choices: choices ?? [
          "네 각이 전부 직각이 됐다는 신호예요",
          "네 변의 길이가 전부 같아졌다는 신호예요",
          "우연이에요, 대각선과 각도는 상관이 없어요",
        ],
        good: "정확해요! 마주 보는 변의 길이가 같은 이 프레임에서 두 대각선까지 같아지면, 네 각이 모두 직각인 <b>직사각형</b>이 확정돼요. 목수들의 오랜 지혜죠. 대각선이 사각형을 어떻게 결정하는지 조작대에서 확인해요!",
        bad: "변의 길이는 밀기 전후 그대로였어요(나무가 늘어나지 않으니). 변한 건 <b>각도</b>죠. 두 대각선이 같아지는 순간 네 각이 전부 직각이 돼요. 그래서 목수는 각도기 대신 줄자를 쓰는 거랍니다!",
        onDone: finish,
      });
    }, 1750);
  });
};

/* 9 pickrect: "직사각형을 모두 고르시오" 시험지 앞의 망설임(포함 관계) */
export const renderPickrect: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  fig.innerHTML = wrapSvg(
    `${CARD}
    ${SHADOW(180, 182, 104, 0.1)}
    <rect x="52" y="18" width="256" height="162" rx="8" fill="url(#pr4-paper)" stroke="#C8D2DC" stroke-width="1.6"/>
    <line x1="68" y1="44" x2="240" y2="44" stroke="#9AAABC" stroke-width="2.4" stroke-linecap="round"/>
    <line x1="68" y1="54" x2="180" y2="54" stroke="#C2CEDA" stroke-width="2" stroke-linecap="round"/>
    <g transform="translate(84 96)">
      <path d="M-14 22 L2 -22 L30 -22 L14 22 Z" fill="url(#pr4-sh1)" stroke="#5A6B7E" stroke-width="1.6"/>
    </g>
    <g transform="translate(158 96)">
      <rect x="-24" y="-16" width="48" height="32" fill="url(#pr4-sh2)" stroke="#5A6B7E" stroke-width="1.6"/>
      <g id="pr4-chk1" style="opacity:0; transition: opacity .4s">
        <path d="M-10 2 l7 8 14 -18" stroke="#1E9E52" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
    </g>
    <g transform="translate(232 96)">
      <rect x="-19" y="-19" width="38" height="38" fill="url(#pr4-sh3)" stroke="#5A6B7E" stroke-width="1.6"/>
      <g id="pr4-qm" style="opacity:0; transition: opacity .4s">
        <text x="0" y="9" text-anchor="middle" font-size="26" font-weight="900" fill="#C2255C">?</text>
      </g>
    </g>
    <g transform="translate(292 96)">
      <path d="M-16 18 L-8 -18 L14 -18 L18 18 Z" fill="url(#pr4-sh4)" stroke="#5A6B7E" stroke-width="1.6"/>
    </g>
    <g id="pr4-pencil" style="transition: transform .7s ${EASE}">
      <g transform="translate(160 148) rotate(-38)">
        <rect x="0" y="-4" width="44" height="8" rx="2" fill="url(#pr4-pen)" stroke="#8C6A1E" stroke-width="1.2"/>
        <path d="M-8 0 L0 -4 L0 4 Z" fill="#F2D8A4" stroke="#8C6A1E" stroke-width="1"/>
        <path d="M-8 0 L-4.5 -1.8 L-4.5 1.8 Z" fill="#33475C"/>
      </g>
    </g>
    <g id="pr4-sweat" style="opacity:0; transition: opacity .4s">
      <path d="M258 62 q3 5 0 8 q-3 -3 0 -8" fill="#79B8F2" stroke="#2B79C0" stroke-width="1"/>
    </g>`,
    `${BG}
    <linearGradient id="pr4-paper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#EEF2F7"/></linearGradient>
    <linearGradient id="pr4-sh1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#D4E7F8"/><stop offset="1" stop-color="#9CC4EC"/></linearGradient>
    <linearGradient id="pr4-sh2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BBD7F2"/><stop offset="1" stop-color="#77AEE4"/></linearGradient>
    <linearGradient id="pr4-sh3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE3A0"/><stop offset="1" stop-color="#EBB854"/></linearGradient>
    <linearGradient id="pr4-sh4" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E4C2F0"/><stop offset="1" stop-color="#C08AD6"/></linearGradient>
    <linearGradient id="pr4-pen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFD98A"/><stop offset="1" stop-color="#E0A93E"/></linearGradient>`,
  );
  const btn = mkBtn("확실한 것부터 체크");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "쪽지 시험 문제: <b>\"직사각형을 모두 고르시오.\"</b> 그림이 넷이에요(기울어진 사각형, 가로 직사각형, 정사각형, 사다리꼴). 일단 확실한 것부터!";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    q<SVGGElement>(fig, "#pr4-chk1").style.opacity = "1";
    window.setTimeout(() => {
      q<SVGGElement>(fig, "#pr4-pencil").style.transform = "translate(64px, -6px)";
    }, 700);
    window.setTimeout(() => {
      q<SVGGElement>(fig, "#pr4-qm").style.opacity = "1";
      q<SVGGElement>(fig, "#pr4-sweat").style.opacity = "1";
      haptic(HAPTIC.tap);
    }, 1350);
    window.setTimeout(() => {
      face("curious");
      helper.innerHTML = "가로 직사각형에 체크! 그런데 연필이 <b>정사각형</b> 앞에서 멈췄어요. 정사각형에도 체크해야 할까요?";
      ask(box, helper, {
        choices: choices ?? [
          "네, 네 각이 모두 직각이니 정사각형도 직사각형이에요",
          "아니요, 정사각형은 정사각형일 뿐 직사각형이 아니에요",
          "그림이 정사각형인지 직사각형인지는 구분할 수 없어요",
        ],
        good: "체크가 맞아요! 직사각형의 자격 조건은 '네 각이 모두 직각'뿐이고, 정사각형은 이 조건을 완벽히 갖췄죠. 가로세로가 달라야 한다는 조건은 어디에도 없어요. 사각형 가족의 족보를 완성하러 가요!",
        bad: "많이들 틀리는 함정이에요! 직사각형의 자격은 '네 각이 모두 직각', 딱 이것뿐이에요. 정사각형은 이 자격을 완벽히 갖췄으니 당당한 직사각형이죠. 눈에 보이는 모양이 아니라 조건으로 판단해요. 족보를 완성하러 가요!",
        onDone: finish,
      });
    }, 2150);
  });
};

/* 10 bentfence: ㄱ자로 꺾인 텃밭 경계를 넓이 그대로 곧게 펴기(등적 변형) */
export const renderBentfence: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  fig.innerHTML = wrapSvg(
    `${CARD}
    <rect x="26" y="34" width="308" height="140" rx="10" fill="url(#bf4-soil)" stroke="#8C6A3A" stroke-width="2"/>
    <path d="M26 104 h84 M110 104 v-40 M110 64 h60" stroke="none"/>
    <path d="M156 34 L156 88 L216 88 L216 174" id="bf4-line" stroke="url(#bf4-fence)" stroke-width="7" stroke-linecap="round" fill="none"/>
    <g opacity=".9">
      ${[0, 1, 2].map((i) => `<g transform="translate(${58 + i * 26} ${64 + (i % 2) * 30})"><path d="M0 8 q-6 -2 -6 -9 q6 -2 8 4 q2 -6 8 -4 q0 7 -6 9 z" fill="url(#bf4-leaf)" stroke="#2E6B2E" stroke-width="1.1"/><line x1="2" y1="8" x2="2" y2="16" stroke="#4A7A3A" stroke-width="1.6"/></g>`).join("")}
      ${[0, 1, 2].map((i) => `<g transform="translate(${252 + (i % 2) * 34} ${58 + i * 32})"><circle r="7" fill="url(#bf4-tomato)" stroke="#9C2A1E" stroke-width="1.2"/><path d="M-2 -6 q2 -3 4 0" stroke="#3E7A2E" stroke-width="1.6" fill="none"/></g>`).join("")}
    </g>
    <g id="bf4-stick">
      <g style="transform: translate(120px, 128px)">
        <circle cx="0" cy="-14" r="7" fill="none" stroke="#33475C" stroke-width="2.4"/>
        <path d="M0 -7 V8 M0 -2 L-9 4 M0 -2 L10 -6 M0 8 L-7 20 M0 8 L7 20" stroke="#33475C" stroke-width="2.4" stroke-linecap="round" fill="none"/>
        <path d="M10 -6 q6 -2 7 -8" stroke="#4A90D9" stroke-width="2.2" fill="none" stroke-linecap="round"/>
        <path d="M17 -14 q4 3 8 3 l-1 4 q-5 0 -9 -4 z" fill="url(#bf4-can)" stroke="#2B5B8C" stroke-width="1.2"/>
      </g>
    </g>
    <g id="bf4-drops" style="opacity:0">
      ${[0, 1, 2].map((i) => `<path d="M${146 + i * 7} ${112 + i * 4} q2 4 0 6 q-2 -2 0 -6" fill="#79B8F2"/>`).join("")}
    </g>
    <text x="70" y="52" font-size="11" font-weight="800" fill="#3E5A2E">1반 상추밭</text>
    <text x="238" y="52" font-size="11" font-weight="800" fill="#7A2E1E">2반 토마토밭</text>`,
    `${BG}
    <linearGradient id="bf4-soil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EAD9B8"/><stop offset=".5" stop-color="#DCC49A"/><stop offset="1" stop-color="#C6A878"/></linearGradient>
    <linearGradient id="bf4-fence" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B0895A"/><stop offset="1" stop-color="#7A5220"/></linearGradient>
    <radialGradient id="bf4-leaf" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#9CD96A"/><stop offset="1" stop-color="#4A9A3A"/></radialGradient>
    <radialGradient id="bf4-tomato" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#FA9A7E"/><stop offset="1" stop-color="#D23A28"/></radialGradient>
    <radialGradient id="bf4-can" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#A9CDF2"/><stop offset="1" stop-color="#4C90D6"/></radialGradient>`,
  );
  const btn = mkBtn("경계 따라 물 주기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "학교 <b>텃밭</b>을 두 반이 나눠 써요. 그런데 경계 울타리가 <b>ㄱ자로 꺾여</b> 있어요. 경계를 따라 물을 줘 볼까요?";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    const stick = q<SVGGElement>(fig, "#bf4-stick > g");
    const drops = q<SVGGElement>(fig, "#bf4-drops");
    stick.style.transition = `transform 1.5s ${EASE}`;
    drops.style.opacity = "1";
    stick.style.transform = "translate(146px, 76px)";
    window.setTimeout(() => { stick.style.transform = "translate(196px, 72px)"; }, 800);
    window.setTimeout(() => { stick.style.transform = "translate(226px, 128px)"; haptic(HAPTIC.tap); }, 1700);
    window.setTimeout(() => {
      face("curious");
      helper.innerHTML = "꺾인 데서 두 번이나 방향을 틀었어요, 번거로워! 울타리를 <b>곧은 직선 하나</b>로 바꾸고 싶은데, 두 밭의 넓이는 어떻게 될까요?";
      ask(box, helper, {
        choices: choices ?? [
          "넓이를 정확히 그대로 지키면서 곧게 펼 수 있어요",
          "곧게 펴면 어느 한 반은 반드시 손해를 봐요",
          "넓이를 지키려면 꺾인 경계를 그대로 둘 수밖에 없어요",
        ],
        good: "맞아요, 가능해요! 열쇠는 <b>평행선</b>이에요. 평행선 사이에서는 삼각형의 꼭짓점을 옆으로 밀어도 넓이가 변하지 않거든요. 이 마법으로 경계를 직접 펴 봐요!",
        bad: "놀랍게도 두 밭 모두 <b>단 한 뼘의 손해도 없이</b> 곧게 펼 수 있어요. 열쇠는 평행선이에요. 평행선 사이에서 삼각형의 꼭짓점을 밀어도 넓이가 그대로라는 성질을 쓰죠. 직접 펴 봐요!",
        onDone: finish,
      });
    }, 2900);
  });
};
