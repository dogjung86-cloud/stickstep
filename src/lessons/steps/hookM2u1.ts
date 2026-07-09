// hookM2u1, 중2 수학 Ⅰ(유리수의 표현과 식의 계산) 훅 장면 10종. hookMath.ts의 mathHook이 디스패치한다.
// 장면 계약: (scene, helper, finish, face, choices?), 공용 hookAsk.ask()만 사용,
// choices[0]=정답, good≠bad(오개념 교정), 소재명·설정은 도입(helper/narrator)에서 소개.
// 조작 먼저 → 예측 나중. 상태 변화는 인라인 스타일 트랜지션 + setTimeout(rAF 금지).
// SVG 파운드리 문법: 3스톱 그라데이션 면 + 좌상단 키라이트 + 접촉 그림자(#2A3A5E) + 재질별 최암색 외곽선.
// 수학 UI 텍스트 em대시 금지(−와 혼동), 제목류는 콜론·본문은 쉼표.
// 장면: calculator·melody·birthday·nines·germs·storage·solarpanel·receipt·kiosk·tangram
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

/* 배경 카드 그라데이션(장면 공용) */
const BG = `<linearGradient id="hk-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F8F2FB"/><stop offset="1" stop-color="#EDE0F3"/></linearGradient>`;
const CARD = `<rect x="10" y="8" width="340" height="184" rx="16" fill="url(#hk-bg)"/>`;

/* ── 1 calculator: 계산기 1÷3, 화면 끝까지 3만 가득 ─────────────── */
export const renderCalculator: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  let keys = "";
  const KL = ["7", "8", "9", "÷", "4", "5", "6", "×", "1", "2", "3", "−", "0", ".", "=", "+"];
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++) {
      const x = 108 + c * 38;
      const y = 96 + r * 22;
      keys += `<rect x="${x}" y="${y}" width="32" height="17" rx="6" fill="url(#cal-k)" stroke="#7D2A93" stroke-width="1"/>
        <text x="${x + 16}" y="${y + 12.5}" text-anchor="middle" font-size="10" font-weight="800" fill="#5E2470">${KL[r * 4 + c]}</text>`;
    }
  fig.innerHTML = wrapSvg(
    `${CARD}${SHADOW(180, 184, 96, 0.12)}
    <rect x="96" y="22" width="168" height="160" rx="16" fill="url(#cal-bd)" stroke="#5E2470" stroke-width="1.6"/>
    <rect x="108" y="34" width="144" height="46" rx="9" fill="url(#cal-sc)" stroke="#5E2470" stroke-width="1.2"/>
    <ellipse cx="126" cy="30" rx="16" ry="4" fill="#fff" opacity=".45"/>
    <text id="cal-disp" x="244" y="64" text-anchor="end" font-size="19" font-weight="800" fill="#2A3648" letter-spacing="1"></text>
    <text id="cal-ell" x="250" y="64" font-size="18" font-weight="900" fill="#9C36B5" opacity="0">…</text>
    ${keys}`,
    `${BG}
    <linearGradient id="cal-bd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C77BD6"/><stop offset=".5" stop-color="#9C36B5"/><stop offset="1" stop-color="#7D2A93"/></linearGradient>
    <linearGradient id="cal-sc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBF6EC"/><stop offset="1" stop-color="#EFE6D2"/></linearGradient>
    <linearGradient id="cal-k" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6EAFA"/><stop offset="1" stop-color="#E0C4EA"/></linearGradient>`,
  );
  const btn = mkBtn("1÷3 눌러 보기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "계산기로 <b>1÷4</b>를 누르면 0.25로 깔끔하게 끝나요. 그럼 <b>1÷3</b>은 어떨까요?";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    const disp = q<SVGTextElement>(fig, "#cal-disp");
    const ell = q<SVGTextElement>(fig, "#cal-ell");
    const target = "0.3333333333";
    let i = 0;
    const type = (): void => {
      i += 1;
      disp.textContent = target.slice(0, i);
      if (i < target.length) window.setTimeout(type, 110);
      else {
        window.setTimeout(() => {
          ell.style.transition = "opacity .4s";
          ell.style.opacity = "1";
          face("surprised");
          helper.innerHTML = "화면 끝까지 3이 가득해요. 화면이 훨씬 더 길다면 <b>이 3의 행렬</b>은 어떻게 될까요?";
          ask(box, helper, {
            choices: choices ?? [
              "3이 영원히 끝나지 않고 이어져요",
              "언젠가는 3이 아닌 숫자가 나와요",
              "충분히 길면 마지막 3에서 딱 끝나요",
            ],
            good: "맞아요, 3은 영원히 끝나지 않아요. 소수점 아래가 끝없이 이어지는 수, 오늘의 주인공이에요.",
            bad: "계산기 화면이 모자랐을 뿐, 1÷3의 3은 화면 밖으로도 영원히 이어져요. 끝나는 수와 안 끝나는 수, 나눗셈 기계로 직접 갈라 봐요.",
            onDone: finish,
          });
        }, 500);
      }
    };
    window.setTimeout(type, 200);
  });
};

/* ── 2 melody: 한 마디 악보로 무한 반복 후렴 ────────────────────── */
export const renderMelody: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  // 음표 4개 묶음(진행 바 위) 3그룹, 재생마다 순서 점등
  const notes = (gx: number, id: string): string =>
    `<g id="${id}" opacity=".16" style="transition: opacity .4s">
      ${[0, 22, 44, 66].map((dx, k) => `<g transform="translate(${gx + dx} ${k % 2 ? 58 : 50})">
        <ellipse cx="0" cy="0" rx="5" ry="3.8" fill="#7D2A93" transform="rotate(-18)"/>
        <path d="M4.4 -1.5 v-16" stroke="#7D2A93" stroke-width="1.8" stroke-linecap="round"/>
      </g>`).join("")}
    </g>`;
  fig.innerHTML = wrapSvg(
    `${CARD}${SHADOW(180, 184, 100, 0.12)}
    ${notes(52, "mel-g1")}${notes(148, "mel-g2")}${notes(244, "mel-g3")}
    <rect x="36" y="84" width="288" height="34" rx="12" fill="url(#mel-ph)" stroke="#5E2470" stroke-width="1.4"/>
    <rect x="50" y="98" width="230" height="6" rx="3" fill="#E4D2EC"/>
    <rect id="mel-fill" x="50" y="98" width="0" height="6" rx="3" fill="url(#mel-fl)"/>
    <path d="M296 95 a7 7 0 1 1 -7 7 M296 95 l-4 -3 m4 3 l-5 2" stroke="#7D2A93" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <rect x="92" y="132" width="176" height="52" rx="12" fill="url(#mel-sc)" stroke="#C9B2D6" stroke-width="1.4"/>
    <g id="mel-score" style="transition: transform .3s; transform-origin: 180px 158px">
      ${[0, 1, 2, 3, 4].map((k) => `<line x1="104" y1="${142 + k * 8}" x2="256" y2="${142 + k * 8}" stroke="#B79BC7" stroke-width="1"/>`).join("")}
      <path d="M112 138 v40 M248 138 v40 M252 138 v40" stroke="#5E2470" stroke-width="2"/>
      <circle cx="250" cy="146" r="1.7" fill="#5E2470"/><circle cx="250" cy="170" r="1.7" fill="#5E2470"/>
      ${[132, 165, 198, 228].map((x, k) => `<g transform="translate(${x} ${k % 2 ? 150 : 166})">
        <ellipse cx="0" cy="0" rx="5.5" ry="4" fill="#9C36B5" transform="rotate(-18)"/>
        <path d="M4.8 -1.6 v-15" stroke="#9C36B5" stroke-width="1.8" stroke-linecap="round"/>
      </g>`).join("")}
    </g>
    <ellipse cx="112" cy="138" rx="14" ry="4" fill="#fff" opacity=".4"/>`,
    `${BG}
    <linearGradient id="mel-ph" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#EFE2F5"/></linearGradient>
    <linearGradient id="mel-fl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#C77BD6"/><stop offset="1" stop-color="#9C36B5"/></linearGradient>
    <linearGradient id="mel-sc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#F3EAF7"/></linearGradient>`,
  );
  const btn = mkBtn("노래 재생하기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "무한 반복 후렴으로 유명한 노래가 있어요. 그런데 작곡가의 악보는 <b>딱 한 마디</b>, 끝에 반복 기호가 전부래요.";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    const fill = q<SVGRectElement>(fig, "#mel-fill");
    // width 속성은 CSS 트랜지션이 안 걸리므로 setTimeout 스텝 체인으로 채운다
    let w = 0;
    const grow = (): void => {
      w += 10;
      fill.setAttribute("width", String(Math.min(230, w)));
      if (w < 230) window.setTimeout(grow, 120);
    };
    grow();
    const groups = ["#mel-g1", "#mel-g2", "#mel-g3"].map((s) => q<SVGGElement>(fig, s));
    const score = q<SVGGElement>(fig, "#mel-score");
    groups.forEach((_, k) =>
      window.setTimeout(() => {
        groups.forEach((o, j) => (o.style.opacity = j === k ? "1" : ".16"));
        score.style.transform = "scale(1.05)";
        window.setTimeout(() => (score.style.transform = "scale(1)"), 180);
        haptic(HAPTIC.tap);
      }, 300 + k * 950),
    );
    window.setTimeout(() => {
      face("surprised");
      helper.innerHTML = "무한 반복되는 후렴, 그런데 악보는 <b>딱 한 마디</b>뿐이에요. 무한히 긴 노래를 종이에 다 적으려면?";
      ask(box, helper, {
        choices: choices ?? [
          "반복되는 한 마디만 적고 반복 표시를 해요",
          "적을 수 없어요, 종이가 무한히 필요해요",
          "앞부분만 적고 뒷부분은 포기해요",
        ],
        good: "정답! 반복되는 한 마디에 반복 표시 하나면 전곡이 담겨요. 무한소수도 똑같은 요령으로 짧게 적을 수 있어요.",
        bad: "무한히 적을 필요도, 포기할 필요도 없어요. 반복되는 한 토막에 반복 표시 하나면 전곡이 담기죠. 숫자의 반복 토막을 찾으러 가요.",
        onDone: finish,
      });
    }, 3400);
  });
};

/* ── 3 birthday: 생일 분수, 딱 떨어지는 생일과 도는 생일 ─────────── */
export const renderBirthday: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  const cal = (x: number, mon: string, day: string, id: string): string =>
    `<g>
      ${SHADOW(x + 62, 148, 52, 0.12)}
      <rect x="${x}" y="26" width="124" height="118" rx="14" fill="url(#bd-card)" stroke="#C9B2D6" stroke-width="1.4"/>
      <rect x="${x}" y="26" width="124" height="30" rx="14" fill="url(#bd-head)"/>
      <rect x="${x}" y="42" width="124" height="14" fill="url(#bd-head)"/>
      <text x="${x + 62}" y="47" text-anchor="middle" font-size="14" font-weight="800" fill="#FFFFFF">${mon}</text>
      <circle cx="${x + 26}" cy="26" r="4" fill="#E4D2EC" stroke="#8A6E96" stroke-width="1.2"/>
      <circle cx="${x + 98}" cy="26" r="4" fill="#E4D2EC" stroke="#8A6E96" stroke-width="1.2"/>
      <text x="${x + 62}" y="106" text-anchor="middle" font-size="42" font-weight="900" fill="#2A3648">${day}</text>
      <ellipse cx="${x + 24}" cy="34" rx="10" ry="3.4" fill="#fff" opacity=".4"/>
      <rect id="${id}-strip" x="${x + 10}" y="118" width="104" height="20" rx="10" fill="#F3EAF7" stroke="#C9B2D6" stroke-width="1.1" style="transition: all .4s"/>
      <text id="${id}-txt" x="${x + 62}" y="132" text-anchor="middle" font-size="11.5" font-weight="800" fill="#8A6E96">?</text>
    </g>`;
  fig.innerHTML = wrapSvg(
    `${CARD}
    ${cal(42, "5월", "8", "bd-l")}
    ${cal(194, "6월", "7", "bd-r")}
    <text x="180" y="96" text-anchor="middle" font-size="13" font-weight="800" fill="#8A6E96">vs</text>
    <g id="bd-tail" opacity="0" style="transition: opacity .5s">
      <text x="180" y="176" text-anchor="middle" font-size="12.5" font-weight="800" fill="#9C36B5">한쪽만 영원히 돌아요!</text>
    </g>`,
    `${BG}
    <linearGradient id="bd-card" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#F1E8F6"/></linearGradient>
    <linearGradient id="bd-head" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#C77BD6"/><stop offset="1" stop-color="#9C36B5"/></linearGradient>`,
  );
  const btn = mkBtn("생일 나눠 보기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "생일로 분수를 만들어 봐요, <b>월/일</b>. 5월 8일생은 5/8, 6월 7일생은 6/7이 되죠. 이제 나눠 볼까요?";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    const lt = q<SVGTextElement>(fig, "#bd-l-txt");
    const ls = q<SVGRectElement>(fig, "#bd-l-strip");
    const rt = q<SVGTextElement>(fig, "#bd-r-txt");
    window.setTimeout(() => {
      lt.textContent = "5÷8 = 0.625 끝!";
      lt.setAttribute("fill", "#0B7A4A");
      ls.setAttribute("stroke", "#57C793");
      ls.setAttribute("fill", "#EFFBF4");
      haptic(HAPTIC.correct);
    }, 400);
    // 오른쪽: 자릿수가 자라나는 연출
    const seq = ["6÷7 = 0.8", "6÷7 = 0.85", "6÷7 = 0.857", "6÷7 = 0.8571", "6÷7 = 0.85714…"];
    seq.forEach((s, k) =>
      window.setTimeout(() => {
        rt.textContent = s;
        rt.setAttribute("fill", "#9C36B5");
      }, 900 + k * 340),
    );
    window.setTimeout(() => {
      q<SVGGElement>(fig, "#bd-tail").style.opacity = "1";
      face("surprised");
      helper.innerHTML = "5월 8일의 5÷8은 0.625로 딱 끝났는데, 6월 7일의 6÷7은 끝나지 않아요. <b>두 수의 운명을 가른 것</b>은?";
      ask(box, helper, {
        choices: choices ?? [
          "나누는 수, 분모가 어떤 수인지가 갈랐어요",
          "나누어지는 수, 분자가 짝수라서 끝났어요",
          "우연이에요, 해 보기 전엔 알 수 없어요",
        ],
        good: "정확해요, 범인은 분모! 분모가 어떤 소인수로 쪼개지는지가 소수의 운명을 결정해요.",
        bad: "분자는 죄가 없고 우연도 아니에요, 같은 분모면 분자를 바꿔도 운명이 같거든요. 운명을 가르는 건 나누는 수, 분모예요. 그 비밀을 실험으로 열어 봐요.",
        onDone: finish,
      });
    }, 900 + seq.length * 340 + 300);
  });
};

/* ── 4 nines: 1/3=0.333… 양변 ×3 → 1=0.999…?! ─────────────────── */
export const renderNines: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  const stick = (x: number, flip: number, id: string): string =>
    `<g id="${id}" style="transition: transform .5s var(--spring, cubic-bezier(.34,1.35,.5,1)); transform-origin: ${x}px 160px">
      <circle cx="${x}" cy="146" r="9" fill="#FFFFFF" stroke="#2A3648" stroke-width="2"/>
      <circle cx="${x - 3 * flip}" cy="145" r="1.2" fill="#2A3648"/><circle cx="${x + 2 * flip}" cy="145" r="1.2" fill="#2A3648"/>
      <path d="M${x} 155 v16 M${x} 160 l${-9 * flip} 7 M${x} 160 l${8 * flip} 5 M${x} 171 l${-6 * flip} 12 M${x} 171 l${6 * flip} 12" stroke="#2A3648" stroke-width="2" stroke-linecap="round" fill="none"/>
    </g>`;
  fig.innerHTML = wrapSvg(
    `${CARD}${SHADOW(180, 186, 106, 0.12)}
    <rect x="40" y="20" width="280" height="110" rx="12" fill="url(#nn-board)" stroke="#3E5C4A" stroke-width="2.4"/>
    <rect x="40" y="126" width="280" height="7" rx="3" fill="url(#nn-tray)" stroke="#8C6A3A" stroke-width="1"/>
    <ellipse cx="82" cy="34" rx="20" ry="5" fill="#fff" opacity=".14"/>
    <g id="nn-eq1" style="transition: opacity .45s">
      <text x="118" y="72" text-anchor="middle" font-size="21" font-weight="800" fill="#F4F8F2">1/3</text>
      <text x="163" y="72" text-anchor="middle" font-size="19" font-weight="800" fill="#F4F8F2">=</text>
      <text x="238" y="72" text-anchor="middle" font-size="21" font-weight="800" fill="#F4F8F2">0.333…</text>
    </g>
    <g id="nn-eq2" opacity="0" style="transition: opacity .45s">
      <text x="118" y="104" text-anchor="middle" font-size="24" font-weight="900" fill="#FFE9A8">1</text>
      <text x="163" y="104" text-anchor="middle" font-size="20" font-weight="800" fill="#F4F8F2">=</text>
      <text x="238" y="104" text-anchor="middle" font-size="24" font-weight="900" fill="#FFE9A8">0.999…</text>
    </g>
    <g id="nn-st1" opacity="0" style="transition: opacity .3s">
      <circle cx="80" cy="52" r="13" fill="url(#nn-stamp)" stroke="#7D2A93" stroke-width="1.6"/>
      <text x="80" y="57" text-anchor="middle" font-size="11" font-weight="900" fill="#FFFFFF">×3</text>
    </g>
    <g id="nn-st2" opacity="0" style="transition: opacity .3s">
      <circle cx="298" cy="52" r="13" fill="url(#nn-stamp)" stroke="#7D2A93" stroke-width="1.6"/>
      <text x="298" y="57" text-anchor="middle" font-size="11" font-weight="900" fill="#FFFFFF">×3</text>
    </g>
    ${stick(120, 1, "nn-p1")}${stick(240, -1, "nn-p2")}`,
    `${BG}
    <linearGradient id="nn-board" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3E6B52"/><stop offset=".5" stop-color="#2F5940"/><stop offset="1" stop-color="#254A34"/></linearGradient>
    <linearGradient id="nn-tray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D9B98A"/><stop offset="1" stop-color="#B08A52"/></linearGradient>
    <radialGradient id="nn-stamp" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#C77BD6"/><stop offset="1" stop-color="#9C36B5"/></radialGradient>`,
  );
  const btn = mkBtn("양변에 ×3 하기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "칠판에 누구나 아는 사실이 적혀 있어요: <b>1/3 = 0.333…</b>. 여기에 장난을 좀 쳐 볼까요?";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    q<SVGGElement>(fig, "#nn-st1").style.opacity = "1";
    window.setTimeout(() => {
      q<SVGGElement>(fig, "#nn-st2").style.opacity = "1";
      haptic(HAPTIC.tap);
    }, 320);
    window.setTimeout(() => {
      q<SVGGElement>(fig, "#nn-eq2").style.opacity = "1";
      haptic(HAPTIC.correct);
    }, 800);
    window.setTimeout(() => {
      q<SVGGElement>(fig, "#nn-p1").style.transform = "rotate(-9deg)";
      q<SVGGElement>(fig, "#nn-p2").style.transform = "rotate(9deg)";
      face("surprised");
      helper.innerHTML = "1/3=0.333…의 양변에 3을 곱했더니 <b>1=0.999…</b>가 됐어요. 이 식을 어떻게 생각해요?";
      ask(box, helper, {
        choices: choices ?? [
          "놀랍지만 참이에요, 0.999…는 1과 같은 수예요",
          "0.999…는 1보다 아주 조금 작아요",
          "어딘가에서 계산 실수가 있었어요",
        ],
        good: "그래요, 참이에요! 0.999…와 1 사이엔 빈틈이 없어요. 오늘 배울 '꼬리 지우기' 기술로 직접 증명까지 할 수 있어요.",
        bad: "계산엔 실수가 없고, '아주 조금'의 빈틈도 없어요. 0.999…는 정말 1이에요! 무한 꼬리를 다루는 기술을 배우면 직접 확인할 수 있어요.",
        onDone: finish,
      });
    }, 1400);
  });
};

/* ── 5 germs: 잠든 사이 입속 세균 20분마다 2배 ─────────────────── */
export const renderGerms: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  // 세균 점 8개 자리(확대경 안), 처음엔 1개만
  const spots: [number, number][] = [[262, 84], [286, 72], [278, 100], [300, 90], [256, 108], [292, 116], [270, 128], [306, 108]];
  const germs = spots
    .map(
      ([x, y], k) =>
        `<g id="gm-g${k}" opacity="${k === 0 ? 1 : 0}" style="transition: opacity .3s, transform .3s">
          <ellipse cx="${x}" cy="${y}" rx="7" ry="5.4" fill="url(#gm-germ)" stroke="#5E7A18" stroke-width="1.1" transform="rotate(${(k * 37) % 60 - 30} ${x} ${y})"/>
          <circle cx="${x - 2}" cy="${y - 1.4}" r="1.1" fill="#F4FBE4" opacity=".8"/>
        </g>`,
    )
    .join("");
  fig.innerHTML = wrapSvg(
    `${CARD}${SHADOW(110, 168, 78, 0.13)}
    <rect x="10" y="8" width="340" height="184" rx="16" fill="url(#gm-night)"/>
    <rect x="34" y="128" width="150" height="34" rx="9" fill="url(#gm-bed)" stroke="#27408B" stroke-width="1.4"/>
    <rect x="34" y="120" width="42" height="18" rx="8" fill="#FFFFFF" stroke="#C2CBD6" stroke-width="1.2"/>
    <circle cx="66" cy="112" r="10" fill="#FFFFFF" stroke="#2A3648" stroke-width="2"/>
    <path d="M60 112 q-1.5 2 0 3.4 M70 111 h3.6" stroke="#2A3648" stroke-width="1.4" stroke-linecap="round" fill="none"/>
    <circle id="gm-snore" cx="82" cy="102" r="3.2" fill="none" stroke="#8FA3C2" stroke-width="1.3" opacity=".8"/>
    <path d="M78 122 q30 -8 62 0" stroke="#2A3648" stroke-width="2" stroke-linecap="round" fill="none"/>
    <g id="gm-clock" style="transform-origin: 130px 62px">
      <circle cx="130" cy="62" r="24" fill="url(#gm-clockf)" stroke="#5E2470" stroke-width="1.6"/>
      <line id="gm-hh" x1="130" y1="62" x2="130" y2="48" stroke="#5E2470" stroke-width="2.4" stroke-linecap="round" style="transform-origin: 130px 62px; transition: transform 2.2s cubic-bezier(.4,0,.3,1)"/>
      <line id="gm-mh" x1="130" y1="62" x2="141" y2="62" stroke="#9C36B5" stroke-width="1.7" stroke-linecap="round" style="transform-origin: 130px 62px; transition: transform 2.2s cubic-bezier(.4,0,.3,1)"/>
      <circle cx="130" cy="62" r="2" fill="#5E2470"/>
      <ellipse cx="121" cy="50" rx="7" ry="3" fill="#fff" opacity=".5"/>
    </g>
    <circle cx="281" cy="100" r="52" fill="url(#gm-lens)" stroke="#7D2A93" stroke-width="2.6"/>
    <path d="M244 140 l-18 22" stroke="#7D2A93" stroke-width="7" stroke-linecap="round"/>
    ${germs}
    <ellipse cx="262" cy="66" rx="16" ry="6" fill="#fff" opacity=".35"/>
    <g id="gm-chain" opacity="0" style="transition: opacity .45s">
      <rect x="88" y="168" width="184" height="20" rx="10" fill="#FFFFFF" stroke="#C9B2D6" stroke-width="1.2"/>
      <text x="180" y="182" text-anchor="middle" font-size="12" font-weight="800" fill="#7D2A93">×2 ×2 ×2 ×2 … 몇 번?</text>
    </g>`,
    `${BG}
    <linearGradient id="gm-night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2A3550"/><stop offset=".55" stop-color="#232D45"/><stop offset="1" stop-color="#1B2334"/></linearGradient>
    <linearGradient id="gm-bed" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5B79D9"/><stop offset="1" stop-color="#3D5BC0"/></linearGradient>
    <radialGradient id="gm-clockf" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#EBDDF2"/></radialGradient>
    <radialGradient id="gm-lens" cx=".4" cy=".32" r=".95"><stop offset="0" stop-color="#FDF8FF"/><stop offset=".7" stop-color="#F2E4F8"/><stop offset="1" stop-color="#E3C9EE"/></radialGradient>
    <radialGradient id="gm-germ" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#CDE86A"/><stop offset="1" stop-color="#8FB024"/></radialGradient>`,
  );
  const btn = mkBtn("8시간 재우기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "잠든 사이 <b>입속 세균은 20분마다 2배</b>로 불어난대요. 확대경 속 세균 한 마리, 밤새 어떻게 될까요?";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    q<SVGLineElement>(fig, "#gm-hh").style.transform = "rotate(240deg)";
    q<SVGLineElement>(fig, "#gm-mh").style.transform = "rotate(690deg)";
    // 1 → 2 → 4 → 8 분열
    [1, 2, 3].forEach((step, si) =>
      window.setTimeout(() => {
        const upto = 2 ** step;
        for (let k = 0; k < upto && k < 8; k++) {
          const g = q<SVGGElement>(fig, `#gm-g${k}`);
          g.style.opacity = "1";
        }
        haptic(HAPTIC.tap);
      }, 700 + si * 620),
    );
    window.setTimeout(() => {
      q<SVGGElement>(fig, "#gm-chain").style.opacity = "1";
      face("surprised");
      helper.innerHTML = "20분마다 2배가 되는 입속 세균, 8시간 자는 동안 <b>×2를 몇 번</b> 곱하게 될까요?";
      ask(box, helper, {
        choices: choices ?? ["24번, 2를 24번 곱해요", "8번, 시간 수만큼요", "16번, 8×2니까요"],
        good: "24번! 한 시간에 3번씩 8시간이니까요. 2를 24번 곱한 수를 일일이 쓰지 않고 다루는 법, 그게 오늘의 무기예요.",
        bad: "한 시간에 20분이 3번 들어가니 8시간이면 3×8=24번이에요. 2×2×…를 24번 쓸 수는 없으니, 지수로 접어서 계산하는 법칙을 배워요.",
        onDone: finish,
      });
    }, 700 + 3 * 620 + 400);
  });
};

/* ── 6 storage: 폰 저장 공간, 2의 거듭제곱 나눗셈 ───────────────── */
export const renderStorage: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  fig.innerHTML = wrapSvg(
    `${CARD}${SHADOW(180, 186, 70, 0.13)}
    <rect x="118" y="14" width="124" height="176" rx="18" fill="url(#st-ph)" stroke="#2A3648" stroke-width="1.8"/>
    <rect x="126" y="30" width="108" height="152" rx="10" fill="url(#st-sc)"/>
    <rect x="150" y="20" width="60" height="5" rx="2.5" fill="#3A4A66"/>
    <ellipse cx="140" cy="36" rx="10" ry="3.4" fill="#fff" opacity=".5"/>
    <text x="180" y="52" text-anchor="middle" font-size="11" font-weight="800" fill="#5E2470">저장 공간</text>
    <rect x="136" y="60" width="88" height="12" rx="6" fill="#E4D8EC"/>
    <rect x="136" y="60" width="30" height="12" rx="6" fill="url(#st-used)"/>
    <g id="st-free" opacity="0" style="transition: opacity .5s">
      <rect x="140" y="80" width="80" height="22" rx="11" fill="#F7ECFA" stroke="#9C36B5" stroke-width="1.3"/>
      <text x="180" y="95" text-anchor="middle" font-size="12.5" font-weight="900" fill="#7D2A93">남은 칸 2<tspan dy="-4.5" font-size="9">35</tspan></text>
    </g>
    <g id="st-video" opacity="0" style="transition: opacity .5s">
      <rect x="136" y="112" width="88" height="46" rx="9" fill="url(#st-vid)" stroke="#27408B" stroke-width="1.3"/>
      <path d="M172 128 l14 7 -14 7 z" fill="#FFFFFF"/>
      <rect x="142" y="146" width="52" height="15" rx="7.5" fill="#FFFFFF" stroke="#C9B2D6" stroke-width="1"/>
      <text x="168" y="157" text-anchor="middle" font-size="10" font-weight="900" fill="#27408B">한 편 2<tspan dy="-3.6" font-size="7.5">28</tspan></text>
    </g>
    <g id="st-q" opacity="0" style="transition: opacity .5s, transform .5s var(--spring, cubic-bezier(.34,1.35,.5,1)); transform-origin: 288px 96px">
      <circle cx="288" cy="96" r="22" fill="url(#st-qb)" stroke="#8C5A12" stroke-width="1.5"/>
      <text x="288" y="104" text-anchor="middle" font-size="22" font-weight="900" fill="#7A4A0E">?</text>
      <text x="288" y="136" text-anchor="middle" font-size="11.5" font-weight="800" fill="#7A4A0E">몇 편 더?</text>
    </g>`,
    `${BG}
    <linearGradient id="st-ph" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4A5A78"/><stop offset="1" stop-color="#2E3C55"/></linearGradient>
    <linearGradient id="st-sc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FDFAFF"/><stop offset="1" stop-color="#EFE3F6"/></linearGradient>
    <linearGradient id="st-used" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#C77BD6"/><stop offset="1" stop-color="#9C36B5"/></linearGradient>
    <linearGradient id="st-vid" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5B79D9"/><stop offset="1" stop-color="#31489C"/></linearGradient>
    <radialGradient id="st-qb" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#FFE3A6"/><stop offset="1" stop-color="#EDAF45"/></radialGradient>`,
  );
  const btn = mkBtn("남은 용량 보기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "여행에서 영상을 잔뜩 찍었더니 폰이 <b>용량 경고</b>를 띄웠어요. 저장 공간을 열어 확인해 봐요.";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    q<SVGGElement>(fig, "#st-free").style.opacity = "1";
    window.setTimeout(() => {
      q<SVGGElement>(fig, "#st-video").style.opacity = "1";
      haptic(HAPTIC.tap);
    }, 500);
    window.setTimeout(() => {
      const qb = q<SVGGElement>(fig, "#st-q");
      qb.style.opacity = "1";
      qb.style.transform = "scale(1)";
      face("surprised");
      helper.innerHTML = "남은 공간이 2³⁵칸, 영상 한 편이 2²⁸칸이에요. <b>몇 편</b> 더 담을 수 있을까요?";
      ask(box, helper, {
        choices: choices ?? ["2⁷편, 지수끼리 35−28을 해요", "2⁵편, 35÷28의 몫이에요", "계산기 없이는 알 수 없어요"],
        good: "2⁷=128편! 거대한 두 수를 직접 나누지 않고 지수끼리 뺄셈 한 번, 그게 오늘의 지름길이에요.",
        bad: "35÷28이 아니라 35−28이에요, 나눗셈이 지수의 뺄셈으로 내려오거든요. 2⁷=128편, 계산기 없이도 나와요. 그 법칙을 직접 확인해 봐요.",
        onDone: finish,
      });
    }, 1050);
  });
};

/* ── 7 solarpanel: 옥상 태양광 패널 3장×2장 ─────────────────────── */
export const renderSolarpanel: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  let slots = "";
  let panels = "";
  for (let r = 0; r < 2; r++)
    for (let c = 0; c < 3; c++) {
      const x = 78 + c * 72;
      const y = 44 + r * 52;
      slots += `<rect x="${x}" y="${y}" width="66" height="46" rx="5" fill="none" stroke="#B79BC7" stroke-width="1.2" stroke-dasharray="5 4"/>`;
      panels += `<g id="sp-p${r * 3 + c}" opacity="0" style="transition: opacity .35s, transform .45s var(--spring, cubic-bezier(.34,1.35,.5,1)); transform: translateY(-16px)">
        <rect x="${x}" y="${y}" width="66" height="46" rx="5" fill="url(#sp-cell)" stroke="#1F2E5C" stroke-width="1.4"/>
        <path d="M${x + 22} ${y} v46 M${x + 44} ${y} v46 M${x} ${y + 23} h66" stroke="#31489C" stroke-width="1"/>
        <path d="M${x + 5} ${y + 7} l16 -5 M${x + 5} ${y + 15} l26 -9" stroke="#FFFFFF" stroke-width="1.6" opacity=".45"/>
      </g>`;
    }
  fig.innerHTML = wrapSvg(
    `${CARD}${SHADOW(180, 178, 118, 0.12)}
    <path d="M30 168 h300" stroke="#8A6E96" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M52 168 l14 -26 h228 l14 26" fill="url(#sp-roof)" stroke="#5E2470" stroke-width="1.5" stroke-linejoin="round"/>
    <circle cx="52" cy="34" r="15" fill="url(#sp-sun)" stroke="#8C5A12" stroke-width="1.3"/>
    <g stroke="#E8A93E" stroke-width="2" stroke-linecap="round"><path d="M52 12 v-4 M52 60 v-2 M30 34 h-4 M74 34 h3 M36 18 l-3 -3 M68 18 l3 -3 M36 50 l-3 3 M68 50 l3 3"/></g>
    <rect x="72" y="38" width="216" height="110" rx="8" fill="url(#sp-frame)" stroke="#5E2470" stroke-width="1.5"/>
    ${slots}${panels}
    <g id="sp-dims" opacity="0" style="transition: opacity .5s">
      <path d="M78 158 h210" stroke="#8A6E96" stroke-width="1.5"/>
      <path d="M78 153 v10 M288 153 v10" stroke="#8A6E96" stroke-width="1.5"/>
      <rect x="160" y="149" width="46" height="18" rx="9" fill="#FFFFFF" stroke="#C9B2D6" stroke-width="1.1"/>
      <text x="183" y="162" text-anchor="middle" font-size="11.5" font-weight="800" font-style="italic" fill="#5E2470">3a</text>
      <path d="M298 44 v98" stroke="#8A6E96" stroke-width="1.5"/>
      <path d="M293 44 h10 M293 142 h10" stroke="#8A6E96" stroke-width="1.5"/>
      <rect x="304" y="84" width="40" height="18" rx="9" fill="#FFFFFF" stroke="#C9B2D6" stroke-width="1.1"/>
      <text x="324" y="97" text-anchor="middle" font-size="11.5" font-weight="800" font-style="italic" fill="#5E2470">2b</text>
    </g>`,
    `${BG}
    <linearGradient id="sp-roof" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E9D8F1"/><stop offset="1" stop-color="#D3B8E2"/></linearGradient>
    <linearGradient id="sp-frame" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F3EAF8"/><stop offset="1" stop-color="#E2CFEC"/></linearGradient>
    <linearGradient id="sp-cell" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5B79D9"/><stop offset=".55" stop-color="#3D5BC0"/><stop offset="1" stop-color="#27408B"/></linearGradient>
    <radialGradient id="sp-sun" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#FFE9B0"/><stop offset="1" stop-color="#EDAF45"/></radialGradient>`,
  );
  const btn = mkBtn("패널 펼치기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "옥상에 태양광 패널을 깔아요. 한 장은 가로 <b>a</b>, 세로 <b>b</b>. 프레임에 가로 3장, 세로 2장이 들어가요.";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    for (let k = 0; k < 6; k++)
      window.setTimeout(() => {
        const p = q<SVGGElement>(fig, `#sp-p${k}`);
        p.style.opacity = "1";
        p.style.transform = "translateY(0)";
        haptic(HAPTIC.tap);
      }, 200 + k * 230);
    window.setTimeout(() => {
      q<SVGGElement>(fig, "#sp-dims").style.opacity = "1";
      face("surprised");
      helper.innerHTML = "한 장이 가로 a·세로 b인 패널을 가로로 3장, 세로로 2장 붙였어요. 전체 넓이 <b>3a×2b</b>를 간단히 하면?";
      ask(box, helper, {
        choices: choices ?? ["6ab, 수는 수끼리 문자는 문자끼리요", "5ab, 3+2를 해요", "32ab, 숫자를 이어 붙여요"],
        good: "6ab! 패널을 세어 봐도 6장, 한 장이 ab니까 딱 맞죠. 수는 수끼리 문자는 문자끼리, '헤쳐 모여'가 오늘의 규칙이에요.",
        bad: "패널 장수를 직접 세어 봐요, 3×2=6장이고 한 장의 넓이가 ab니까 6ab예요. 3×2는 곱해야지 더하거나 이어 붙이면 안 돼요. 헤쳐 모여로 정리해 봐요.",
        onDone: finish,
      });
    }, 200 + 6 * 230 + 420);
  });
};

/* ── 8 receipt: 분식집 영수증 두 장 합치기 ──────────────────────── */
export const renderReceipt: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  const receipt = (x: number, y: number, rot: number, id: string, rows: string): string =>
    `<g id="${id}" style="transition: transform .6s var(--spring, cubic-bezier(.34,1.35,.5,1)), opacity .5s; transform-origin: ${x + 60}px ${y + 60}px">
      ${SHADOW(x + 60, y + 118, 48, 0.12)}
      <g transform="rotate(${rot} ${x + 60} ${y + 60})">
        <rect x="${x}" y="${y}" width="120" height="112" rx="7" fill="url(#rc-paper)" stroke="#C9D2DC" stroke-width="1.3"/>
        <path d="M${x} ${y + 108} l10 6 10 -6 10 6 10 -6 10 6 10 -6 10 6 10 -6 10 6 10 -6 10 6 10 -6" stroke="#C9D2DC" stroke-width="1.2" fill="none"/>
        <rect x="${x + 14}" y="${y + 10}" width="92" height="13" rx="6.5" fill="url(#rc-head)"/>
        <text x="${x + 60}" y="${y + 20}" text-anchor="middle" font-size="9.5" font-weight="900" fill="#FFFFFF">분식 영수증</text>
        ${rows}
        <ellipse cx="${x + 26}" cy="${y + 8}" rx="9" ry="2.6" fill="#fff" opacity=".6"/>
      </g>
    </g>`;
  const row = (x: number, y: number, name: string, cnt: string, price: string): string =>
    `<text x="${x + 14}" y="${y}" font-size="10.5" font-weight="800" fill="#2A3648">${name}</text>
     <text x="${x + 72}" y="${y}" font-size="10.5" font-weight="800" fill="#7D2A93">${cnt}</text>
     <text x="${x + 106}" y="${y}" text-anchor="end" font-size="10" font-weight="700" fill="#64748B" font-style="italic">${price}</text>`;
  fig.innerHTML = wrapSvg(
    `${CARD}
    <path d="M24 178 h312" stroke="#B08A52" stroke-width="3" stroke-linecap="round" opacity=".5"/>
    ${receipt(56, 36, -4, "rc-r1", row(56, 78, "떡볶이", "2인분", "a원") + row(56, 98, "음료", "1잔", "b원"))}
    ${receipt(190, 36, 3, "rc-r2", row(190, 78, "떡볶이", "3인분", "a원") + row(190, 98, "음료", "2잔", "b원"))}
    <g id="rc-sum" opacity="0" style="transition: opacity .5s, transform .5s var(--spring, cubic-bezier(.34,1.35,.5,1)); transform-origin: 180px 168px">
      <rect x="112" y="154" width="136" height="28" rx="14" fill="url(#rc-sumbg)" stroke="#7D2A93" stroke-width="1.4"/>
      <text x="180" y="173" text-anchor="middle" font-size="13" font-weight="900" fill="#FFFFFF">합친 금액은 ?</text>
    </g>`,
    `${BG}
    <linearGradient id="rc-paper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#F0F3F7"/></linearGradient>
    <linearGradient id="rc-head" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#F27D8E"/><stop offset="1" stop-color="#D8465C"/></linearGradient>
    <linearGradient id="rc-sumbg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#B85CCB"/><stop offset="1" stop-color="#9C36B5"/></linearGradient>`,
  );
  const r2 = q<SVGGElement>(fig, "#rc-r2");
  r2.style.opacity = "0";
  r2.style.transform = "translateX(60px)";
  const btn = mkBtn("영수증 합치기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "분식집에서 떡볶이 <b>a원</b> 2인분과 음료 <b>b원</b> 1잔을 시켰어요. 그런데 친구가 늦게 와서 추가 주문!";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    r2.style.opacity = "1";
    r2.style.transform = "translateX(0)";
    window.setTimeout(() => {
      const sum = q<SVGGElement>(fig, "#rc-sum");
      sum.style.opacity = "1";
      sum.style.transform = "scale(1)";
      haptic(HAPTIC.tap);
      face("surprised");
      helper.innerHTML = "떡볶이 a원 2인분과 음료 b원 1잔, 거기에 떡볶이 3인분과 음료 2잔을 더 시켰어요. 합친 금액을 식으로 쓰면?";
      ask(box, helper, {
        choices: choices ?? ["5a+3b원, 같은 것끼리 더해요", "5ab+3원, 전부 한 덩어리로 합쳐요", "2a+3b+3a원, 더 못 줄여요"],
        good: "5a+3b원! 떡볶이는 떡볶이끼리 2+3인분, 음료는 음료끼리 1+2잔. 같은 것끼리만 더한다, 이게 다항식 정리의 전부예요.",
        bad: "떡볶이와 음료를 한 덩어리로 섞을 순 없어요, 값이 다르니까요. 떡볶이끼리 2a+3a=5a, 음료끼리 b+2b=3b, 그래서 5a+3b원이에요. 이차식까지 이 요령으로 정리해 봐요.",
        onDone: finish,
      });
    }, 800);
  });
};

/* ── 9 kiosk: 키오스크 화면 두 구역, 잘라도 넓이 그대로 ─────────── */
export const renderKiosk: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  let menu = "";
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 2; c++)
      menu += `<rect x="${104 + c * 44}" y="${52 + r * 32}" width="38" height="26" rx="5" fill="url(#ki-tile)" stroke="#7D2A93" stroke-width="1"/>
        <circle cx="${115 + c * 44}" cy="${62 + r * 32}" r="4.5" fill="#E8A93E" opacity=".85"/>
        <rect x="${123 + c * 44}" y="${59 + r * 32}" width="14" height="3" rx="1.5" fill="#B79BC7"/>
        <rect x="${123 + c * 44}" y="${66 + r * 32}" width="10" height="3" rx="1.5" fill="#D9C7E4"/>`;
  fig.innerHTML = wrapSvg(
    `${CARD}${SHADOW(180, 188, 60, 0.14)}
    <rect x="168" y="156" width="24" height="26" fill="url(#ki-stand)" stroke="#2A3648" stroke-width="1.4"/>
    <rect x="140" y="180" width="80" height="8" rx="4" fill="url(#ki-stand)" stroke="#2A3648" stroke-width="1.4"/>
    <rect x="88" y="30" width="184" height="130" rx="12" fill="url(#ki-body)" stroke="#2A3648" stroke-width="1.8"/>
    <ellipse cx="112" cy="40" rx="14" ry="4" fill="#fff" opacity=".4"/>
    <g id="ki-left" style="transition: transform .45s var(--spring, cubic-bezier(.34,1.35,.5,1))">
      <rect x="96" y="44" width="102" height="102" rx="7" fill="url(#ki-scr)" stroke="#5E2470" stroke-width="1.2"/>
      ${menu}
    </g>
    <g id="ki-right" style="transition: transform .45s var(--spring, cubic-bezier(.34,1.35,.5,1))">
      <rect x="202" y="44" width="60" height="102" rx="7" fill="url(#ki-pay)" stroke="#8C5A12" stroke-width="1.2"/>
      <rect x="209" y="54" width="46" height="10" rx="5" fill="#FFFFFF" opacity=".85"/>
      <rect x="209" y="70" width="46" height="10" rx="5" fill="#FFFFFF" opacity=".65"/>
      <rect x="209" y="120" width="46" height="18" rx="9" fill="url(#ki-paybtn)" stroke="#7D2A93" stroke-width="1"/>
      <text x="232" y="133" text-anchor="middle" font-size="10" font-weight="900" fill="#FFFFFF">결제</text>
    </g>
    <line id="ki-cut" x1="200" y1="40" x2="200" y2="150" stroke="#E8434F" stroke-width="2.2" stroke-dasharray="6 4" opacity="0" style="transition: opacity .4s"/>
    <g id="ki-dims" opacity="0" style="transition: opacity .5s">
      <rect x="126" y="152" width="42" height="17" rx="8.5" fill="#FFFFFF" stroke="#C9B2D6" stroke-width="1"/>
      <text x="147" y="164" text-anchor="middle" font-size="10.5" font-weight="800" font-style="italic" fill="#5E2470">4a</text>
      <rect x="212" y="152" width="38" height="17" rx="8.5" fill="#FFFFFF" stroke="#C9B2D6" stroke-width="1"/>
      <text x="231" y="164" text-anchor="middle" font-size="10.5" font-weight="800" font-style="italic" fill="#7A4A0E">b</text>
      <rect x="60" y="86" width="38" height="17" rx="8.5" fill="#FFFFFF" stroke="#C9B2D6" stroke-width="1"/>
      <text x="79" y="98" text-anchor="middle" font-size="10.5" font-weight="800" font-style="italic" fill="#5E2470">3a</text>
    </g>`,
    `${BG}
    <linearGradient id="ki-body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4A5A78"/><stop offset="1" stop-color="#2E3C55"/></linearGradient>
    <linearGradient id="ki-stand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5A6A88"/><stop offset="1" stop-color="#3A4862"/></linearGradient>
    <linearGradient id="ki-scr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBF6FE"/><stop offset="1" stop-color="#EDDFF5"/></linearGradient>
    <linearGradient id="ki-tile" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#F0E4F6"/></linearGradient>
    <linearGradient id="ki-pay" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBEFD8"/><stop offset="1" stop-color="#F2D9A8"/></linearGradient>
    <linearGradient id="ki-paybtn" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#B85CCB"/><stop offset="1" stop-color="#9C36B5"/></linearGradient>`,
  );
  const btn = mkBtn("화면 나눠 보기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "분식집 <b>키오스크</b> 화면은 메뉴 구역과 결제 구역, 둘로 나뉘어 있어요. 세로는 3a, 가로는 두 구역을 합쳐 (4a+b)래요.";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    const cut = q<SVGLineElement>(fig, "#ki-cut");
    const L = q<SVGGElement>(fig, "#ki-left");
    const R = q<SVGGElement>(fig, "#ki-right");
    cut.style.opacity = "1";
    window.setTimeout(() => {
      L.style.transform = "translateX(-6px)";
      R.style.transform = "translateX(6px)";
      haptic(HAPTIC.tap);
    }, 420);
    window.setTimeout(() => {
      L.style.transform = "translateX(0)";
      R.style.transform = "translateX(0)";
    }, 1050);
    window.setTimeout(() => {
      q<SVGGElement>(fig, "#ki-dims").style.opacity = "1";
      face("surprised");
      helper.innerHTML = "세로 3a, 가로 (4a+b)인 키오스크 화면이 두 구역으로 나뉘어 있어요. 전체 넓이 3a(4a+b)와 <b>두 구역 넓이의 합</b>은?";
      ask(box, helper, {
        choices: choices ?? [
          "같아요, 잘라도 넓이는 사라지지 않아요",
          "달라요, 자르면 경계선만큼 넓이가 줄어요",
          "화면 크기를 재 보기 전엔 알 수 없어요",
        ],
        good: "같아요! 3a×4a와 3a×b를 더하면 전체와 똑같죠. 괄호 식을 조각 합으로 여는 이 기술이 오늘 배울 '전개'예요.",
        bad: "수학의 경계선은 폭이 0이라 넓이를 훔치지 못해요, 재 볼 필요도 없이 항상 같아요. 3a(4a+b)=12a²+3ab, 괄호를 여는 기술을 배워 봐요.",
        onDone: finish,
      });
    }, 1600);
  });
};

/* ── 10 tangram: 칠교 조각 맞추기, 문자 딱지로 둘레 재기 ─────────
   정식 칠교 분할(합동 검산 완료, 8×8 격자 ×13 스케일):
   큰삼각형 2·중간삼각형 1·작은삼각형 2·정사각형 1·평행사변형 1, 넓이 합 = 전체 ✓ */
export const renderTangram: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  const S = 13; // 격자 1칸 픽셀
  const OX = 128;
  const OY = 34;
  const P = (pts: [number, number][]): string => pts.map(([gx, gy]) => `${OX + gx * S},${OY + gy * S}`).join(" ");
  interface Piece {
    pts: [number, number][];
    fill: string;
    ink: string;
    from: [number, number, number]; // 흩어진 시작(dx, dy, rot)
  }
  const pieces: Piece[] = [
    { pts: [[0, 0], [8, 0], [4, 4]], fill: "url(#tg-a)", ink: "#7D2A93", from: [-92, -18, -14] },
    { pts: [[0, 0], [0, 8], [4, 4]], fill: "url(#tg-b)", ink: "#7D2A93", from: [-104, 52, 12] },
    { pts: [[8, 0], [8, 4], [6, 2]], fill: "url(#tg-c)", ink: "#8C5A12", from: [96, -26, 20] },
    { pts: [[6, 2], [8, 4], [6, 6], [4, 4]], fill: "url(#tg-d)", ink: "#0A87A3", from: [104, 30, -18] },
    { pts: [[8, 4], [8, 8], [4, 8]], fill: "url(#tg-e)", ink: "#8C5A12", from: [88, 74, 10] },
    { pts: [[0, 8], [2, 6], [6, 6], [4, 8]], fill: "url(#tg-f)", ink: "#27408B", from: [-70, 88, -10] },
    { pts: [[2, 6], [4, 4], [6, 6]], fill: "url(#tg-g)", ink: "#B0206E", from: [10, 108, 24] },
  ];
  const polys = pieces
    .map(
      (p, k) => `<g id="tg-p${k}" style="transition: transform .6s var(--spring, cubic-bezier(.34,1.35,.5,1)); transform: translate(${p.from[0]}px, ${p.from[1]}px) rotate(${p.from[2]}deg); transform-origin: ${OX + 4 * S}px ${OY + 4 * S}px">
        <polygon points="${P(p.pts)}" fill="${p.fill}" stroke="${p.ink}" stroke-width="1.6" stroke-linejoin="round"/>
      </g>`,
    )
    .join("");
  const tag = (x: number, y: number, t: string, id: string): string =>
    `<g id="${id}" opacity="0" style="transition: opacity .4s, transform .4s var(--spring, cubic-bezier(.34,1.35,.5,1)); transform-origin: ${x}px ${y}px">
      <rect x="${x - 17}" y="${y - 10}" width="34" height="20" rx="10" fill="#FFFFFF" stroke="#9C36B5" stroke-width="1.3"/>
      <text x="${x}" y="${y + 4.5}" text-anchor="middle" font-size="11.5" font-weight="800" font-style="italic" fill="#7D2A93">${t}</text>
    </g>`;
  fig.innerHTML = wrapSvg(
    `${CARD}${SHADOW(180, 184, 92, 0.12)}
    <rect x="${OX}" y="${OY}" width="${8 * S}" height="${8 * S}" fill="none" stroke="#C9B2D6" stroke-width="1.4" stroke-dasharray="6 5" rx="3"/>
    ${polys}
    ${tag(OX - 26, OY + 4 * S, "2a", "tg-t1")}
    ${tag(OX + 4 * S, OY + 8 * S + 20, "2a", "tg-t2")}
    ${tag(OX + 8 * S + 26, OY + 4 * S, "2a", "tg-t3")}
    ${tag(OX + 4 * S, OY - 18, "2a", "tg-t4")}`,
    `${BG}
    <linearGradient id="tg-a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C77BD6"/><stop offset="1" stop-color="#9C36B5"/></linearGradient>
    <linearGradient id="tg-b" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E3B9EE"/><stop offset="1" stop-color="#C77BD6"/></linearGradient>
    <linearGradient id="tg-c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFD98A"/><stop offset="1" stop-color="#E8A93E"/></linearGradient>
    <linearGradient id="tg-d" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9BDCEE"/><stop offset="1" stop-color="#3FB4D4"/></linearGradient>
    <linearGradient id="tg-e" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FBE7C0"/><stop offset="1" stop-color="#EDAF45"/></linearGradient>
    <linearGradient id="tg-f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8FA8EE"/><stop offset="1" stop-color="#4763CE"/></linearGradient>
    <linearGradient id="tg-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F284B4"/><stop offset="1" stop-color="#D84690"/></linearGradient>`,
  );
  const btn = mkBtn("조각 맞추기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "일곱 조각 <b>칠교</b>가 흩어져 있어요. 조각을 다 맞추면 큰 정사각형이 되는데, 변마다 <b>2a 같은 문자 딱지</b>가 붙는대요.";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    pieces.forEach((_, k) =>
      window.setTimeout(() => {
        q<SVGGElement>(fig, `#tg-p${k}`).style.transform = "translate(0px, 0px) rotate(0deg)";
        haptic(HAPTIC.tap);
      }, 150 + k * 190),
    );
    ["tg-t1", "tg-t2", "tg-t3", "tg-t4"].forEach((id, k) =>
      window.setTimeout(() => {
        const t = q<SVGGElement>(fig, `#${id}`);
        t.style.opacity = "1";
        t.style.transform = "scale(1)";
      }, 150 + 7 * 190 + 200 + k * 160),
    );
    window.setTimeout(() => {
      face("surprised");
      helper.innerHTML = "칠교 조각으로 만든 모양의 둘레, 자가 없어도 변마다 붙은 <b>문자 딱지</b>만으로 잴 수 있을까요?";
      ask(box, helper, {
        choices: choices ?? [
          "잴 수 있어요, 변의 식을 전부 더하면 돼요",
          "잴 수 없어요, 길이는 자로만 재요",
          "정사각형일 때만 잴 수 있어요",
        ],
        good: "그렇죠! 변마다 붙은 문자 딱지를 전부 더하면 둘레가 식 하나로 나와요. 오늘은 식 계산 실력으로 도형을 재는 날이에요.",
        bad: "자보다 좋은 게 있어요, 변마다 2a 같은 딱지가 붙어 있으면 어떤 모양이든 전부 더해 식으로 잴 수 있죠. 식 계산 실력을 도형에 써 봐요.",
        onDone: finish,
      });
    }, 150 + 7 * 190 + 200 + 4 * 160 + 320);
  });
};
