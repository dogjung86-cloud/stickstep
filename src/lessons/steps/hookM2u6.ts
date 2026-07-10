// hookM2u6, 중2 수학 Ⅵ(확률) 훅 장면 9종. hookMath.ts의 mathHook이 디스패치한다.
// 장면 계약: (scene, helper, finish, face, choices?), 공용 hookAsk.ask()만 사용,
// choices[0]=정답, good≠bad(오개념 교정), 소재명·설정은 도입(helper/narrator)에서 소개.
// 조작 먼저 → 예측 나중. 상태 변화는 인라인 스타일 트랜지션 + setTimeout(rAF 금지).
// SVG 파운드리 문법: 3스톱 그라데이션 면 + 좌상단 키라이트 + 접촉 그림자(#2A3A5E) + 재질별 최암색 외곽선.
// 수학 UI 텍스트 em대시 금지(−와 혼동), 제목류는 콜론·본문은 쉼표.
// 장면: boardgame·ottnight·avatar·cointoss·sundaynight·gacha·roulette·doublespin·umbrella
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

/* 배경 카드 그라데이션(장면 공용), 주사위 레드 크림 톤(단원 액센트 #C92A2A 계열) */
const BG = `<linearGradient id="h6-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FEF7F4"/><stop offset=".55" stop-color="#FBECE6"/><stop offset="1" stop-color="#F5DCD3"/></linearGradient>`;
const CARD = `<rect x="10" y="8" width="340" height="184" rx="16" fill="url(#h6-bg)"/>`;
const EASE = "cubic-bezier(.22,1,.36,1)";
const SPRING = "var(--spring, cubic-bezier(.34,1.35,.5,1))";

/* 주사위 면(윗면 뷰) — pip 배치는 표준 주사위 눈 */
const PIP: Record<number, [number, number][]> = {
  1: [[0, 0]],
  2: [[-9, -9], [9, 9]],
  3: [[-10, -10], [0, 0], [10, 10]],
  4: [[-9, -9], [9, -9], [-9, 9], [9, 9]],
  5: [[-10, -10], [10, -10], [0, 0], [-10, 10], [10, 10]],
  6: [[-9, -11], [9, -11], [-9, 0], [9, 0], [-9, 11], [9, 11]],
};
const diceFace = (cx: number, cy: number, n: number, size = 52, id = "d"): string =>
  `<g id="${id}">
    <rect x="${cx - size / 2}" y="${cy - size / 2}" width="${size}" height="${size}" rx="${size * 0.22}" fill="url(#h6-dice)" stroke="#8F1D1D" stroke-width="2"/>
    <ellipse cx="${cx - size * 0.22}" cy="${cy - size * 0.3}" rx="${size * 0.2}" ry="${size * 0.09}" fill="#fff" opacity=".55"/>
    ${(PIP[n] ?? []).map(([dx, dy]) => `<circle cx="${cx + dx * (size / 52)}" cy="${cy + dy * (size / 52)}" r="${size * 0.072}" fill="#5A1414"/>`).join("")}
  </g>`;

/* ── 1 boardgame: 뱀사다리 탈출 직전, 6만? 짝수만? (경우의 수) ── */
export const renderBoardgame: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  fig.innerHTML = wrapSvg(
    `${CARD}
    ${SHADOW(96, 176, 60, 0.12)}
    <g>
      <rect x="36" y="52" width="120" height="120" rx="10" fill="url(#bg6-board)" stroke="#9C6A2E" stroke-width="2"/>
      ${[0, 1, 2].map((r) => [0, 1, 2].map((c) => `<rect x="${44 + c * 36}" y="${60 + r * 36}" width="32" height="32" rx="5" fill="${(r + c) % 2 ? "#F7E7C8" : "#FBF2DF"}" stroke="#D9BE8C" stroke-width="1"/>`).join("")).join("")}
      <path d="M52 154 q10 -14 24 -6 q14 8 22 -6" stroke="#3E9C5C" stroke-width="4" fill="none" stroke-linecap="round"/>
      <circle cx="152" cy="66" r="3.5" fill="#C92A2A"/>
      <path d="M152 66 v-18 l14 5 -14 5" fill="#C92A2A" stroke="#8F1D1D" stroke-width="1.2"/>
      <circle cx="66" cy="140" r="8" fill="url(#bg6-stick)" stroke="#20304C" stroke-width="1.6"/>
      <path d="M66 148 v14 M66 154 l-7 8 M66 154 l7 8 M66 152 l-8 -4 M66 152 l8 -4" stroke="#20304C" stroke-width="2" stroke-linecap="round"/>
    </g>
    ${diceFace(236, 96, 3, 56, "bg6-dice")}
    <g id="bg6-cards" style="opacity:1">
      <rect x="196" y="136" width="76" height="40" rx="8" fill="url(#bg6-ca)" stroke="#8F1D1D" stroke-width="1.6"/>
      <text x="234" y="153" text-anchor="middle" font-size="10" font-weight="800" fill="#8F1D1D">규칙 A</text>
      <text x="234" y="168" text-anchor="middle" font-size="10.5" font-weight="900" fill="#5A1414">6이 나오면 탈출</text>
      <rect x="278" y="136" width="72" height="40" rx="8" fill="url(#bg6-cb)" stroke="#1D4E8F" stroke-width="1.6"/>
      <text x="314" y="153" text-anchor="middle" font-size="10" font-weight="800" fill="#1D4E8F">규칙 B</text>
      <text x="314" y="168" text-anchor="middle" font-size="10.5" font-weight="900" fill="#14325A">짝수면 탈출</text>
    </g>`,
    `${BG}
    <linearGradient id="bg6-board" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2D9A8"/><stop offset=".6" stop-color="#E8C685"/><stop offset="1" stop-color="#D9AE62"/></linearGradient>
    <radialGradient id="bg6-stick" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#FFE9C9"/><stop offset="1" stop-color="#F5C98C"/></radialGradient>
    <linearGradient id="bg6-ca" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF3F0"/><stop offset="1" stop-color="#F8D8D0"/></linearGradient>
    <linearGradient id="bg6-cb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F0F6FF"/><stop offset="1" stop-color="#D3E2F8"/></linearGradient>
    <linearGradient id="h6-dice" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".6" stop-color="#F6E8E4"/><stop offset="1" stop-color="#EBCFC7"/></linearGradient>`,
  );
  const btn = mkBtn("주사위 굴려 보기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "보드게임 막판, 마지막 칸 탈출 규칙을 고를 수 있어요. <b>규칙 A: 6이 나오면 탈출</b>, <b>규칙 B: 짝수가 나오면 탈출</b>. 먼저 주사위를 굴려 볼까요?";

  let rolls = 0;
  const seq = [[5, 2, 4], [1, 6, 3]]; // 연출용 눈 순서(마지막 값이 결과)
  btn.addEventListener("click", () => {
    if (rolls >= 2) return;
    haptic(HAPTIC.select);
    const frames = seq[rolls];
    rolls += 1;
    frames.forEach((n, i) => {
      window.setTimeout(() => {
        const g = q<SVGGElement>(fig, "#bg6-dice");
        g.outerHTML = diceFace(236, 96, n, 56, "bg6-dice");
        if (i === frames.length - 1) {
          const okA = n === 6;
          const okB = n % 2 === 0;
          helper.innerHTML = `이번 눈은 <b>${n}</b>! 규칙 A는 ${okA ? "<b>탈출 성공</b>" : "실패"}, 규칙 B는 ${okB ? "<b>탈출 성공</b>" : "실패"}이네요. ${rolls < 2 ? "한 번 더 굴려 봐요." : ""}`;
          if (rolls === 2) {
            btn.disabled = true;
            btn.classList.remove("pulse");
            window.setTimeout(() => {
              face("curious");
              helper.innerHTML = "운에 맡기기 전에 따져 봐요. 어느 규칙이 더 유리할까요?";
              ask(box, helper, {
                choices: choices ?? [
                  "규칙 B, 되는 눈이 2·4·6로 세 가지라서",
                  "규칙 A, 6이 가장 큰 눈이라서",
                  "둘 다 똑같아요, 어차피 운이니까",
                ],
                good: "정확해요! 규칙 A가 성공하는 경우는 6 하나, 규칙 B는 2·4·6 <b>세 가지</b>예요. 운을 따지기 전에 <b>되는 경우가 몇 가지인지</b> 세는 것, 그게 이 단원의 첫걸음이에요.",
                bad: "운이라고 다 같은 운이 아니에요. 규칙 A가 성공하는 눈은 6 하나뿐인데 규칙 B는 2·4·6 <b>세 가지</b>거든요. 되는 경우의 가짓수를 세어 보면 유불리가 한눈에 보여요!",
                onDone: finish,
              });
            }, 900);
          }
        }
      }, 220 * (i + 1));
    });
  });
};

/* ── 2 ottnight: 코미디 5편 또는 액션 3편, 또는이면 더한다 ── */
export const renderOttnight: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  const poster = (x: number, y: number, hue: string, dark: string, cls: string): string =>
    `<rect class="${cls}" x="${x}" y="${y}" width="42" height="58" rx="6" fill="url(#ot6-${hue})" stroke="${dark}" stroke-width="1.6" style="transition: opacity .4s, transform .45s ${SPRING}; transform-box: fill-box; transform-origin: center"/>`;
  fig.innerHTML = wrapSvg(
    `${CARD}
    <rect x="26" y="20" width="308" height="160" rx="12" fill="url(#ot6-tv)" stroke="#232B3A" stroke-width="2.2"/>
    <text x="46" y="52" font-size="12" font-weight="900" fill="#FFD9CF">코미디</text>
    <g id="ot6-com">${[0, 1, 2, 3, 4].map((i) => poster(46 + i * 50, 62, "warm", "#8F4A1D", "ot6-cp")).join("")}</g>
    <text x="46" y="142" font-size="12" font-weight="900" fill="#CFE0FF">액션</text>
    <g id="ot6-act" opacity=".95">${[0, 1, 2].map((i) => poster(46 + i * 50, 148, "cool", "#1D3E8F", "ot6-ap")).join("")}</g>
    <g id="ot6-badge" style="opacity:0; transition: opacity .5s">
      <rect x="252" y="132" width="76" height="30" rx="15" fill="url(#ot6-bd)" stroke="#8F1D1D" stroke-width="1.6"/>
      <text id="ot6-bdtext" x="290" y="152" text-anchor="middle" font-size="13" font-weight="900" fill="#fff"></text>
    </g>`,
    `${BG}
    <linearGradient id="ot6-tv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A4356"/><stop offset=".6" stop-color="#2A3242"/><stop offset="1" stop-color="#1E2532"/></linearGradient>
    <linearGradient id="ot6-warm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFC98A"/><stop offset=".6" stop-color="#F0983E"/><stop offset="1" stop-color="#D9752A"/></linearGradient>
    <linearGradient id="ot6-cool" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8AB4FF"/><stop offset=".6" stop-color="#4A7BE8"/><stop offset="1" stop-color="#2A57C2"/></linearGradient>
    <linearGradient id="ot6-bd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E85A4E"/><stop offset="1" stop-color="#C92A2A"/></linearGradient>`,
  );
  const btn = mkBtn("두 줄 다 세어 보기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "금요일 밤, 오늘은 <b>딱 한 편</b>만 보기로 했어요. 화면에는 <b>코미디 5편</b>이 한 줄, <b>액션 3편</b>이 한 줄. 먼저 후보를 세어 볼까요?";

  let stage = 0;
  btn.addEventListener("click", () => {
    haptic(HAPTIC.select);
    if (stage === 0) {
      stage = 1;
      fig.querySelectorAll<SVGRectElement>(".ot6-cp").forEach((r, i) => {
        window.setTimeout(() => (r.style.transform = "translateY(-6px)"), i * 90);
      });
      const badge = q<SVGGElement>(fig, "#ot6-badge");
      badge.style.opacity = "1";
      q<SVGTextElement>(fig, "#ot6-bdtext").textContent = "코미디 5";
      helper.innerHTML = "코미디 줄에서 고르는 경우는 <b>5가지</b>. 이제 액션 줄을 세어 봐요.";
      btn.querySelector("span")!.textContent = "액션 줄 세기";
      return;
    }
    if (stage === 1) {
      stage = 2;
      btn.disabled = true;
      btn.classList.remove("pulse");
      fig.querySelectorAll<SVGRectElement>(".ot6-ap").forEach((r, i) => {
        window.setTimeout(() => (r.style.transform = "translateY(-6px)"), i * 90);
      });
      q<SVGTextElement>(fig, "#ot6-bdtext").textContent = "액션 3";
      window.setTimeout(() => {
        face("curious");
        helper.innerHTML = "코미디에서 골라도 되고, 액션에서 골라도 돼요. 오늘 밤 고를 수 있는 영화는 모두 몇 편일까요?";
        ask(box, helper, {
          choices: choices ?? [
            "5+3으로 모두 8편이에요",
            "5×3으로 모두 15편이에요",
            "더 많은 쪽만 세서 5편이에요",
          ],
          good: "맞아요! 한 편만 고르니 코미디에서 오<b>거나</b> 액션에서 오<b>거나</b>, 두 줄을 <b>더해서</b> 8편이에요. 그런데 아무 때나 더해도 될까요? 검문소에서 확인해 봐요.",
          bad: "곱하면 '코미디 한 편과 액션 한 편을 <b>같이</b> 보는' 경우를 세는 셈이 돼요. 오늘 밤은 딱 한 편, 이쪽 <b>또는</b> 저쪽이니 5+3=8편이랍니다.",
          onDone: finish,
        });
      }, 700);
    }
  });
};

/* ── 3 avatar: 게임 아바타 모자 3종 × 옷 2종, 동시 선택은 곱 ── */
export const renderAvatar: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  const HATS = ["#E8A93E", "#4A7BE8", "#C2255C"]; // 캡·비니·베레
  const TOPS = ["#3E9C5C", "#7C5CE8"]; // 티셔츠·후드
  fig.innerHTML = wrapSvg(
    `${CARD}
    ${SHADOW(120, 178, 46, 0.12)}
    <g>
      <circle cx="120" cy="86" r="22" fill="url(#av6-skin)" stroke="#20304C" stroke-width="2"/>
      <circle cx="113" cy="84" r="2.4" fill="#20304C"/><circle cx="127" cy="84" r="2.4" fill="#20304C"/>
      <path d="M113 94 q7 6 14 0" stroke="#20304C" stroke-width="2" stroke-linecap="round" fill="none"/>
      <g id="av6-hat"><path d="M98 74 a22 22 0 0 1 44 0 z" fill="${HATS[0]}" stroke="#7A551D" stroke-width="1.8"/><rect x="118" y="58" width="30" height="9" rx="4.5" fill="${HATS[0]}" stroke="#7A551D" stroke-width="1.6"/></g>
      <g id="av6-top"><rect x="98" y="110" width="44" height="52" rx="12" fill="${TOPS[0]}" stroke="#1D5A34" stroke-width="2"/><path d="M98 124 l-12 16 M142 124 l12 16" stroke="#20304C" stroke-width="4" stroke-linecap="round"/></g>
      <path d="M112 162 v14 M128 162 v14" stroke="#20304C" stroke-width="4" stroke-linecap="round"/>
    </g>
    <g font-size="11" font-weight="800" fill="#5A6B7E">
      <text x="228" y="46">모자 3종</text>
      <text x="228" y="112">옷 2종</text>
    </g>
    <g id="av6-hats">${HATS.map((c, i) => `<circle cx="${240 + i * 34}" cy="66" r="12" fill="${c}" stroke="#4A3A18" stroke-width="1.6"/>`).join("")}</g>
    <g id="av6-tops">${TOPS.map((c, i) => `<rect x="${228 + i * 34}" y="122" width="24" height="26" rx="7" fill="${c}" stroke="#1D3A28" stroke-width="1.6"/>`).join("")}</g>
    <g id="av6-count">
      <rect x="222" y="158" width="112" height="26" rx="13" fill="url(#av6-cnt)" stroke="#8F1D1D" stroke-width="1.4"/>
      <text id="av6-cnttext" x="278" y="176" text-anchor="middle" font-size="11.5" font-weight="900" fill="#fff">입어 본 조합 1가지</text>
    </g>`,
    `${BG}
    <radialGradient id="av6-skin" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#FFE9C9"/><stop offset="1" stop-color="#F5C98C"/></radialGradient>
    <linearGradient id="av6-cnt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E85A4E"/><stop offset="1" stop-color="#C92A2A"/></linearGradient>`,
  );
  const btn = mkBtn("다른 조합 입어 보기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "새 게임의 아바타 꾸미기 화면이에요. <b>모자 3종</b>과 <b>옷 2종</b>이 있죠. 조합을 바꿔 가며 몇 가지나 나오는지 감을 잡아 봐요!";

  let hi = 0;
  let ti = 0;
  const seen = new Set<string>(["0-0"]);
  let asked = false;
  const update = (): void => {
    seen.add(`${hi}-${ti}`);
    q<SVGGElement>(fig, "#av6-hat").innerHTML =
      `<path d="M98 74 a22 22 0 0 1 44 0 z" fill="${HATS[hi]}" stroke="#4A3A18" stroke-width="1.8"/>` +
      (hi === 0 ? `<rect x="118" y="58" width="30" height="9" rx="4.5" fill="${HATS[hi]}" stroke="#4A3A18" stroke-width="1.6"/>` : hi === 1 ? `<rect x="100" y="66" width="40" height="8" rx="4" fill="${HATS[hi]}" stroke="#1D3A6E" stroke-width="1.6"/>` : `<circle cx="136" cy="60" r="5" fill="${HATS[hi]}" stroke="#6E1433" stroke-width="1.4"/>`);
    q<SVGGElement>(fig, "#av6-top").innerHTML =
      `<rect x="98" y="110" width="44" height="52" rx="12" fill="${TOPS[ti]}" stroke="${ti === 0 ? "#1D5A34" : "#3A2A7A"}" stroke-width="2"/>` +
      (ti === 1 ? `<path d="M110 110 q10 10 20 0" stroke="#3A2A7A" stroke-width="2" fill="none"/>` : "") +
      `<path d="M98 124 l-12 16 M142 124 l12 16" stroke="#20304C" stroke-width="4" stroke-linecap="round"/>`;
    q<SVGTextElement>(fig, "#av6-cnttext").textContent = `입어 본 조합 ${seen.size}가지`;
    if (seen.size >= 4 && !asked) {
      asked = true;
      window.setTimeout(() => {
        face("curious");
        btn.disabled = true;
        btn.classList.remove("pulse");
        helper.innerHTML = "벌써 조합 4가지를 입어 봤어요. 전부 몇 가지인지 다 입어 보지 않고도 알 수 있을까요?";
        ask(box, helper, {
          choices: choices ?? [
            "3×2로 모두 6가지예요",
            "3+2로 모두 5가지예요",
            "직접 다 입어 봐야만 알 수 있어요",
          ],
          good: "정확해요! 모자 하나<b>마다</b> 옷이 2벌씩 갈라지니 3×2=6가지예요. '각각에 대하여' 가지가 벌어질 땐 <b>곱해요</b>. 나뭇가지 그림으로 눈에 담아 봐요.",
          bad: "더하기는 '모자 <b>또는</b> 옷 중 하나만' 고를 때의 셈법이에요. 지금은 모자와 옷을 <b>함께</b> 입죠. 모자 하나마다 옷 2벌이 갈라지니 3×2=6가지랍니다.",
          onDone: finish,
        });
      }, 650);
    }
  };
  // 한 버튼이 모자→옷을 번갈아 바꿔 새 조합을 입힌다(훅 단일 버튼 관례).
  let turn = 0;
  btn.addEventListener("click", () => {
    if (asked) return;
    haptic(HAPTIC.tap);
    if (turn % 2 === 0) hi = (hi + 1) % 3;
    else ti = (ti + 1) % 2;
    turn += 1;
    update();
  });
};

/* ── 4 cointoss: 동전으로 정하는 게 왜 공평할까 (확률의 개념) ── */
export const renderCointoss: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  fig.innerHTML = wrapSvg(
    `${CARD}
    ${SHADOW(180, 156, 56, 0.12)}
    <g id="ct6-coin" style="transform-box: view-box; transform-origin:180px 96px; transition: transform .5s ${EASE}">
      <circle cx="180" cy="96" r="42" fill="url(#ct6-gold)" stroke="#8C6A1E" stroke-width="2.4"/>
      <circle cx="180" cy="96" r="33" fill="none" stroke="#B8925C" stroke-width="1.6"/>
      <text id="ct6-facetext" x="180" y="104" text-anchor="middle" font-size="22" font-weight="900" fill="#7A551D">앞</text>
      <ellipse cx="166" cy="78" rx="12" ry="5" fill="#fff" opacity=".5" transform="rotate(-24 166 78)"/>
    </g>
    <g id="ct6-strip" font-size="13" font-weight="900"></g>
    <text x="180" y="176" text-anchor="middle" font-size="11" font-weight="800" fill="#5A6B7E">기록</text>`,
    `${BG}
    <radialGradient id="ct6-gold" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#FFE08A"/><stop offset=".6" stop-color="#E8B93E"/><stop offset="1" stop-color="#C9962A"/></radialGradient>`,
  );
  const btn = mkBtn("동전 던지기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "축구 경기 시작 전, 심판이 <b>동전</b>을 던져 진영을 정해요. 게임 순서 정할 때도 동전이 등장하죠. 직접 몇 번 던져 볼까요?";

  const results = ["앞", "뒤", "뒤"]; // 연출용(랜덤이면 e2e가 흔들린다)
  let n = 0;
  btn.addEventListener("click", () => {
    if (n >= results.length) return;
    haptic(HAPTIC.select);
    const coin = q<SVGGElement>(fig, "#ct6-coin");
    coin.style.transform = "translateY(-26px) scaleY(.12)";
    const r = results[n];
    n += 1;
    window.setTimeout(() => {
      q<SVGTextElement>(fig, "#ct6-facetext").textContent = r;
      coin.style.transform = "translateY(0) scaleY(1)";
      const strip = q<SVGGElement>(fig, "#ct6-strip");
      strip.innerHTML += `<g><circle cx="${118 + (n - 1) * 42}" cy="158" r="13" fill="${r === "앞" ? "url(#ct6-gold)" : "#E5E9F2"}" stroke="#8C6A1E" stroke-width="1.4"/><text x="${118 + (n - 1) * 42}" y="163" text-anchor="middle" fill="#5A4A18">${r}</text></g>`;
      if (n === results.length) {
        btn.disabled = true;
        btn.classList.remove("pulse");
        window.setTimeout(() => {
          face("curious");
          helper.innerHTML = "세 번 던졌더니 앞 1번, 뒤 2번이 나왔네요. 그런데도 동전 정하기가 <b>공평</b>하다고 모두가 믿는 이유는 뭘까요?";
          ask(box, helper, {
            choices: choices ?? [
              "앞면과 뒷면이 나올 가능성이 똑같아서",
              "동전은 던질 때마다 앞뒤가 번갈아 나와서",
              "무거운 쪽이 아래로 가서 결과가 정해져 있어서",
            ],
            good: "바로 그거예요! 두 면이 나올 <b>가능성이 똑같다</b>는 믿음 덕분이죠. 방금처럼 몇 번은 한쪽으로 쏠려도요. 그 '가능성'을 정확한 수로 재는 법을 실험실에서 찾아봐요.",
            bad: "방금 기록을 봐요, 뒤가 연달아 나왔죠? 번갈아 나오지도, 정해져 있지도 않아요. 다만 두 면의 <b>가능성이 똑같아서</b> 공평한 거예요. 이 가능성을 수로 재러 가 봐요!",
            onDone: finish,
          });
        }, 800);
      }
    }, 480);
  });
};

/* ── 5 sundaynight: 일요일 밤, 내일이 토요일일 확률 (확률 0과 1) ── */
export const renderSundaynight: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  fig.innerHTML = wrapSvg(
    `${CARD}
    ${SHADOW(110, 176, 66, 0.12)}
    <g>
      <rect x="44" y="128" width="132" height="40" rx="10" fill="url(#sn6-bed)" stroke="#7A4A7A" stroke-width="2"/>
      <rect x="44" y="112" width="34" height="24" rx="8" fill="#FFF6E8" stroke="#C9B08C" stroke-width="1.6"/>
      <circle cx="96" cy="116" r="11" fill="url(#av6-skin2)" stroke="#20304C" stroke-width="1.8"/>
      <path d="M92 114 q2 3 4 0 M100 114 q2 3 4 0" stroke="#20304C" stroke-width="1.6" fill="none"/>
      <path d="M107 122 q22 -4 44 6" stroke="#20304C" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <path d="M30 40 a14 14 0 1 0 16 20 a11 11 0 0 1 -16 -20" fill="#F5E3A8" stroke="#C9AE5C" stroke-width="1.4"/>
    </g>
    <g id="sn6-cal">
      <rect x="212" y="34" width="120" height="132" rx="12" fill="url(#sn6-calbg)" stroke="#8F1D1D" stroke-width="2"/>
      <rect x="212" y="34" width="120" height="34" rx="12" fill="url(#sn6-calhd)"/>
      <rect x="212" y="56" width="120" height="12" fill="#F8E3DD"/>
      <text id="sn6-day" x="272" y="58" text-anchor="middle" font-size="15" font-weight="900" fill="#fff">일요일</text>
      <text id="sn6-num" x="272" y="128" text-anchor="middle" font-size="44" font-weight="900" fill="#3A2A2A">13</text>
      <text id="sn6-note" x="272" y="154" text-anchor="middle" font-size="10.5" font-weight="800" fill="#8F1D1D">오늘, 밤 10시</text>
    </g>`,
    `${BG}
    <linearGradient id="sn6-bed" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C99CD9"/><stop offset=".6" stop-color="#A96FBF"/><stop offset="1" stop-color="#8C4FA0"/></linearGradient>
    <radialGradient id="av6-skin2" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#FFE9C9"/><stop offset="1" stop-color="#F5C98C"/></radialGradient>
    <linearGradient id="sn6-calbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFDF8"/><stop offset="1" stop-color="#F2E6DC"/></linearGradient>
    <linearGradient id="sn6-calhd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E85A4E"/><stop offset="1" stop-color="#C92A2A"/></linearGradient>`,
  );
  const btn = mkBtn("달력 한 장 넘기기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "일요일 밤 10시, 침대에서 이런 생각이 들어요. \"내일이 <b>토요일</b>이면 얼마나 좋을까...\" 달력을 넘겨 내일을 확인해 봐요.";

  let flipped = false;
  btn.addEventListener("click", () => {
    if (flipped) return;
    flipped = true;
    haptic(HAPTIC.select);
    const cal = q<SVGGElement>(fig, "#sn6-cal");
    cal.style.transition = `transform .35s ${EASE}`;
    cal.style.transformBox = "view-box";
    cal.style.transformOrigin = "272px 100px";
    cal.style.transform = "scaleY(.06)";
    window.setTimeout(() => {
      q<SVGTextElement>(fig, "#sn6-day").textContent = "월요일";
      q<SVGTextElement>(fig, "#sn6-num").textContent = "14";
      q<SVGTextElement>(fig, "#sn6-note").textContent = "내일";
      cal.style.transform = "scaleY(1)";
      btn.disabled = true;
      btn.classList.remove("pulse");
      window.setTimeout(() => {
        face("surprised");
        helper.innerHTML = "역시나, 일요일의 내일은 <b>월요일</b>이네요. 그럼 일요일 밤에 '내일이 토요일'일 확률은 얼마일까요?";
        ask(box, helper, {
          choices: choices ?? [
            "0이에요, 절대 일어나지 않으니까",
            "7분의 1이에요, 요일이 7개니까",
            "아주 작지만 0보다는 커요",
          ],
          good: "맞아요! 일요일 다음 날은 <b>반드시 월요일</b>, '내일이 토요일'은 절대 일어나지 않는 사건이라 확률이 딱 <b>0</b>이에요. 그럼 확률이 <b>1</b>인 사건은 뭘까요? 눈금 랩에서 만나요.",
          bad: "요일이 7개라도 '내일'은 이미 정해져 있어요, 일요일 다음은 반드시 월요일이니까요. 절대 일어나지 않는 사건의 확률은 딱 <b>0</b>이랍니다. 0과 1, 확률의 양 끝을 만나러 가요.",
          onDone: finish,
        });
      }, 800);
    }, 380);
  });
};

/* ── 6 gacha: 5성 확률 3%, 그럼 꽝은? (일어나지 않을 확률) ── */
export const renderGacha: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  fig.innerHTML = wrapSvg(
    `${CARD}
    ${SHADOW(180, 178, 84, 0.12)}
    <rect x="96" y="22" width="168" height="34" rx="17" fill="url(#gc6-ban)" stroke="#8F1D1D" stroke-width="1.8"/>
    <text x="180" y="44" text-anchor="middle" font-size="13" font-weight="900" fill="#fff">전설 등급 확률 3%</text>
    <g id="gc6-packs"></g>`,
    `${BG}
    <linearGradient id="gc6-ban" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E85A4E"/><stop offset="1" stop-color="#C92A2A"/></linearGradient>
    <linearGradient id="gc6-pack" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B49CE8"/><stop offset=".6" stop-color="#8A66D9"/><stop offset="1" stop-color="#6E4AC2"/></linearGradient>
    <linearGradient id="gc6-dud" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E9EDF5"/><stop offset="1" stop-color="#C7CEDC"/></linearGradient>`,
  );
  const btn = mkBtn("10연속 뽑기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "게임 속 카드 뽑기 화면이에요. 배너에 <b>전설 등급 확률 3%</b>라고 적혀 있죠. 큰맘 먹고 10연속 뽑기를 눌러 볼까요?";

  let pulled = false;
  btn.addEventListener("click", () => {
    if (pulled) return;
    pulled = true;
    haptic(HAPTIC.select);
    const packs = q<SVGGElement>(fig, "#gc6-packs");
    for (let i = 0; i < 10; i++) {
      const x = 52 + (i % 5) * 54;
      const y = 72 + Math.floor(i / 5) * 56;
      window.setTimeout(() => {
        haptic(HAPTIC.tap);
        packs.innerHTML +=
          `<g style="opacity:0; animation: none">` +
          `<rect x="${x}" y="${y}" width="44" height="46" rx="7" fill="url(#gc6-dud)" stroke="#8A93A6" stroke-width="1.6"/>` +
          `<text x="${x + 22}" y="${y + 29}" text-anchor="middle" font-size="11" font-weight="900" fill="#6E7787">꽝</text>` +
          `</g>`;
        const g = packs.lastElementChild as SVGGElement;
        g.style.transition = "opacity .3s";
        void g.getBoundingClientRect(); // 트랜지션 시작 전 강제 리플로(rAF 금지 규칙)
        g.style.opacity = "1";
      }, 150 * i);
    }
    window.setTimeout(() => {
      btn.disabled = true;
      btn.classList.remove("pulse");
      face("surprised");
      helper.innerHTML = "10장 전부 꽝... 하지만 놀랄 일은 아니에요. 그럼 <b>한 번</b> 뽑을 때 전설이 <b>안 나올</b> 확률은 얼마일까요?";
      ask(box, helper, {
        choices: choices ?? [
          "97%, 전체 100%에서 3%를 빼면 돼요",
          "50%, 나오거나 안 나오거나 둘 중 하나니까",
          "3%, 나올 확률과 항상 같아요",
        ],
        good: "정답! 나오거나(3%) 안 나오거나, 두 확률을 합치면 반드시 <b>100%</b>가 돼요. 그래서 안 나올 확률은 100-3=<b>97%</b>. '전체에서 빼기', 이 지름길을 랩에서 갈고닦아요.",
        bad: "'되거나 안 되거나 반반'은 확률의 대표 함정이에요! 반반은 두 경우의 <b>가능성이 똑같을 때</b>만 성립하죠. 전설은 3%로 드무니, 안 나올 확률은 100-3=<b>97%</b>랍니다.",
        onDone: finish,
      });
    }, 150 * 10 + 700);
  });
};

/* ── 7 roulette: 흩어진 당첨 칸, 이거나 저거나 (확률의 덧셈) ── */
export const renderRoulette: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  const R = 64;
  const CX = 180;
  const CY = 106;
  const slice = (i: number, win: boolean): string => {
    const a0 = (i * 45 - 90) * (Math.PI / 180);
    const a1 = ((i + 1) * 45 - 90) * (Math.PI / 180);
    const x0 = CX + R * Math.cos(a0);
    const y0 = CY + R * Math.sin(a0);
    const x1 = CX + R * Math.cos(a1);
    const y1 = CY + R * Math.sin(a1);
    return `<path d="M${CX} ${CY} L${x0.toFixed(1)} ${y0.toFixed(1)} A${R} ${R} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)} Z" fill="${win ? "url(#rl6-win)" : "url(#rl6-dud)"}" stroke="#8F1D1D" stroke-width="1.6"/>`;
  };
  const WINS = [0, 3, 5]; // 흩어진 당첨 칸 3개
  fig.innerHTML = wrapSvg(
    `${CARD}
    ${SHADOW(CX, 182, 62, 0.12)}
    <g id="rl6-wheel" style="transform-box: view-box; transform-origin:${CX}px ${CY}px; transition: transform 1.4s cubic-bezier(.2,.8,.2,1)">
      ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => slice(i, WINS.includes(i))).join("")}
      <circle cx="${CX}" cy="${CY}" r="10" fill="url(#rl6-hub)" stroke="#8F1D1D" stroke-width="1.6"/>
    </g>
    <path d="M${CX} ${CY - R - 12} l-8 -12 h16 z" fill="#3A2A2A" stroke="#1E1414" stroke-width="1.4"/>
    <g font-size="10.5" font-weight="800">
      <text x="60" y="52" fill="#C92A2A">당첨 3칸</text>
      <text x="60" y="68" fill="#8A93A6">꽝 5칸</text>
    </g>`,
    `${BG}
    <linearGradient id="rl6-win" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F98CA6"/><stop offset=".6" stop-color="#E8547E"/><stop offset="1" stop-color="#C2255C"/></linearGradient>
    <linearGradient id="rl6-dud" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4F6FA"/><stop offset="1" stop-color="#D9DFEA"/></linearGradient>
    <radialGradient id="rl6-hub" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#FFD9CF"/><stop offset="1" stop-color="#C92A2A"/></radialGradient>`,
  );
  const btn = mkBtn("원판 돌리기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "문구점 이벤트 원판이에요. 똑같은 8칸 중 <b>당첨이 3칸</b>인데, 얄궂게도 서로 <b>떨어져</b> 있네요. 일단 한 번 돌려 봐요!";

  let spun = false;
  btn.addEventListener("click", () => {
    if (spun) return;
    spun = true;
    haptic(HAPTIC.select);
    q<SVGGElement>(fig, "#rl6-wheel").style.transform = "rotate(1035deg)"; // 2바퀴 반 + 45×7 근처, 꽝에 멈춤
    window.setTimeout(() => {
      btn.disabled = true;
      btn.classList.remove("pulse");
      face("curious");
      helper.innerHTML = "아쉽게 꽝! 그런데 당첨 칸이 이렇게 흩어져 있을 때, 당첨될 확률은 어떻게 구할까요?";
      ask(box, helper, {
        choices: choices ?? [
          "8분의 1씩 세 칸이니 더해서 8분의 3이에요",
          "붙어 있지 않으니 8분의 1로 세야 해요",
          "당첨 아니면 꽝, 반반이에요",
        ],
        good: "맞아요! 칸 하나의 확률은 1/8씩, 당첨 칸이 3개니 1/8+1/8+1/8=<b>3/8</b>이에요. 떨어져 있어도 '이 칸<b>이거나</b> 저 칸이거나'는 <b>더하면</b> 되죠. 오늘의 규칙이에요.",
        bad: "흩어져 있어도 당첨은 당첨! 세 칸이 <b>동시에 걸릴 수는 없으니</b> 각 칸의 확률 1/8을 세 번 더해 <b>3/8</b>이에요. 반반도 아니죠, 꽝이 5칸으로 더 많으니까요.",
        onDone: finish,
      });
    }, 1500);
  });
};

/* ── 8 doublespin: 두 원판 모두 당첨이어야 상품 (확률의 곱셈) ── */
export const renderDoublespin: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  const wheel = (cx: number, cy: number, r: number, id: string): string => {
    const half = (start: number, win: boolean): string => {
      const a0 = (start - 90) * (Math.PI / 180);
      const a1 = (start + 90 - 90) * (Math.PI / 180);
      const x0 = cx + r * Math.cos(a0);
      const y0 = cy + r * Math.sin(a0);
      const x1 = cx + r * Math.cos(a1);
      const y1 = cy + r * Math.sin(a1);
      return `<path d="M${cx} ${cy} L${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)} Z" fill="${win ? "url(#rl6-win2)" : "url(#rl6-dud2)"}" stroke="#8F1D1D" stroke-width="1.6"/>`;
    };
    return (
      `<g id="${id}" style="transform-box: view-box; transform-origin:${cx}px ${cy}px; transition: transform 1.3s cubic-bezier(.2,.8,.2,1)">` +
      half(0, true) +
      half(180, false) +
      `<circle cx="${cx}" cy="${cy}" r="7" fill="url(#rl6-hub2)" stroke="#8F1D1D" stroke-width="1.4"/></g>` +
      `<path d="M${cx} ${cy - r - 10} l-7 -10 h14 z" fill="#3A2A2A" stroke="#1E1414" stroke-width="1.2"/>`
    );
  };
  fig.innerHTML = wrapSvg(
    `${CARD}
    ${SHADOW(112, 174, 50, 0.12)}${SHADOW(248, 174, 50, 0.12)}
    ${wheel(112, 106, 48, "ds6-w1")}
    ${wheel(248, 106, 48, "ds6-w2")}
    <text x="112" y="180" text-anchor="middle" font-size="11" font-weight="800" fill="#5A6B7E">1번 원판, 당첨 반</text>
    <text x="248" y="180" text-anchor="middle" font-size="11" font-weight="800" fill="#5A6B7E">2번 원판, 당첨 반</text>`,
    `${BG}
    <linearGradient id="rl6-win2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F98CA6"/><stop offset=".6" stop-color="#E8547E"/><stop offset="1" stop-color="#C2255C"/></linearGradient>
    <linearGradient id="rl6-dud2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4F6FA"/><stop offset="1" stop-color="#D9DFEA"/></linearGradient>
    <radialGradient id="rl6-hub2" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#FFD9CF"/><stop offset="1" stop-color="#C92A2A"/></radialGradient>`,
  );
  const btn = mkBtn("두 원판 동시에 돌리기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "더블 찬스 이벤트! 반은 당첨, 반은 꽝인 원판이 <b>두 개</b> 있어요. 상품을 받으려면 <b>둘 다 당첨</b>에 멈춰야 하죠. 돌려 볼까요?";

  let spun = false;
  btn.addEventListener("click", () => {
    if (spun) return;
    spun = true;
    haptic(HAPTIC.select);
    q<SVGGElement>(fig, "#ds6-w1").style.transform = "rotate(990deg)"; // 당첨 반원에 멈춤
    q<SVGGElement>(fig, "#ds6-w2").style.transform = "rotate(1170deg)"; // 꽝 반원에 멈춤
    window.setTimeout(() => {
      btn.disabled = true;
      btn.classList.remove("pulse");
      face("surprised");
      helper.innerHTML = "1번은 당첨인데 2번이 꽝! 하나만 당첨은 소용없어요. '둘 다 당첨'일 확률은 원판 하나의 당첨 확률(반)과 비교해 어떨까요?";
      ask(box, helper, {
        choices: choices ?? [
          "절반의 절반, 4분의 1로 줄어요",
          "반반이 두 번이니 그대로 2분의 1이에요",
          "기회가 두 번이라 확률이 두 배로 커져요",
        ],
        good: "정확해요! 1번에서 절반으로 줄고, 그중에서 2번이 또 절반으로 줄어 2분의 1 곱하기 2분의 1 = <b>4분의 1</b>이에요. '이것<b>도</b> 저것<b>도</b>'는 <b>곱하기</b>, 넓이 모델로 눈에 담아 봐요.",
        bad: "기회가 두 번이면 '적어도 한 번 당첨'은 쉬워지지만, '<b>둘 다</b> 당첨'은 오히려 어려워져요. 절반에서 다시 절반으로, 2분의 1 곱하기 2분의 1 = <b>4분의 1</b>이랍니다.",
        onDone: finish,
      });
    }, 1400);
  });
};

/* ── 9 umbrella: 비 올 확률 60%, 우산 챙길까 (확률의 활용) ── */
export const renderUmbrella: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  fig.innerHTML = wrapSvg(
    `${CARD}
    ${SHADOW(96, 178, 44, 0.12)}
    <g>
      <path d="M60 120 a36 36 0 0 1 72 0 z" fill="url(#um6-umb)" stroke="#8F1D1D" stroke-width="2"/>
      <path d="M60 120 q9 -8 18 0 q9 -8 18 0 q9 -8 18 0 q9 -8 18 0" stroke="#8F1D1D" stroke-width="1.6" fill="none"/>
      <path d="M96 120 v46 q0 10 -10 10" stroke="#5A4A3A" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    </g>
    <g id="um6-phone">
      <rect x="196" y="30" width="132" height="150" rx="16" fill="url(#um6-ph)" stroke="#232B3A" stroke-width="2.2"/>
      <rect x="208" y="46" width="108" height="60" rx="10" fill="url(#um6-sky)"/>
      <path d="M232 76 a10 10 0 0 1 2 -19.8 a13 13 0 0 1 25 -2.6 a10.5 10.5 0 0 1 4 20.4 z" fill="#FFFFFF" opacity=".92"/>
      <path d="M234 84 l-4 9 M246 84 l-4 9 M258 84 l-4 9" stroke="#4A7BE8" stroke-width="2.6" stroke-linecap="round"/>
      <text id="um6-pct" x="262" y="140" text-anchor="middle" font-size="26" font-weight="900" fill="#20304C">?</text>
      <text x="262" y="162" text-anchor="middle" font-size="10.5" font-weight="800" fill="#5A6B7E">내일 강수 확률</text>
    </g>`,
    `${BG}
    <linearGradient id="um6-umb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F98C7E"/><stop offset=".6" stop-color="#E85A4E"/><stop offset="1" stop-color="#C92A2A"/></linearGradient>
    <linearGradient id="um6-ph" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FDFEFF"/><stop offset="1" stop-color="#E8EDF6"/></linearGradient>
    <linearGradient id="um6-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8AB4FF"/><stop offset="1" stop-color="#5A8AE8"/></linearGradient>`,
  );
  const btn = mkBtn("예보 확인하기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "내일 소풍 전날 밤, 우산을 챙길지 말지 고민이에요. 판단 재료는 날씨 앱의 <b>강수 확률</b> 하나. 예보를 확인해 볼까요?";

  let checked = false;
  btn.addEventListener("click", () => {
    if (checked) return;
    checked = true;
    haptic(HAPTIC.select);
    q<SVGTextElement>(fig, "#um6-pct").textContent = "60%";
    btn.disabled = true;
    btn.classList.remove("pulse");
    window.setTimeout(() => {
      face("curious");
      helper.innerHTML = "<b>강수 확률 60%</b>. 그런데 이 60%라는 수, 정확히 무슨 뜻일까요?";
      ask(box, helper, {
        choices: choices ?? [
          "내일 같은 조건의 날 100번 중 60번꼴로 비가 왔다는 뜻",
          "내일 하루의 60% 시간 동안 비가 온다는 뜻",
          "우리 동네 면적의 60%에 비가 온다는 뜻",
        ],
        good: "맞아요! 오랜 관찰 기록에서 <b>이런 날씨 조건이면 100번 중 60번꼴</b>로 비가 왔다는 뜻이에요. 시간도 면적도 아니죠. 이 수 하나로 우산을 챙길지 <b>결정</b>하는 법, 마지막 레슨에서 배워요.",
        bad: "그럴듯하지만 아니에요! 강수 확률은 시간이나 면적의 비율이 아니라, <b>같은 조건의 날들을 아주 많이 관찰했을 때 100번 중 60번꼴</b>로 비가 왔다는 뜻이에요. 이 수로 결정하는 법을 배우러 가요.",
        onDone: finish,
      });
    }, 700);
  });
};
