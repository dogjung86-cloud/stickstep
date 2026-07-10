// hookM2u5, 중2 수학 Ⅴ(닮음과 피타고라스) 훅 장면 11종. hookMath.ts의 mathHook이 디스패치한다.
// 장면 계약: (scene, helper, finish, face, choices?), 공용 hookAsk.ask()만 사용,
// choices[0]=정답, good≠bad(오개념 교정), 소재명·설정은 도입(helper/narrator)에서 소개.
// 조작 먼저 → 예측 나중. 상태 변화는 인라인 스타일 트랜지션 + setTimeout(rAF 금지).
// SVG 파운드리 문법: 3스톱 그라데이션 면 + 좌상단 키라이트 + 접촉 그림자(#2A3A5E) + 재질별 최암색 외곽선.
// 수학 UI 텍스트 em대시 금지(−와 혼동), 제목류는 콜론·본문은 쉼표.
// 장면: photoedit·papersize·jumbobear·triruler·streetlamp·hillroad·grasscut·letterfold·traytrick·tvsize·courtline
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

/** 손그림 스틱맨(머리 fill + 한 획 포즈), hookMath4 stargaze 문법. */
const stick = (x: number, y: number, s: number, pose: string, color = "#243040"): string =>
  `<g transform="translate(${x} ${y}) scale(${s})">
    <circle cx="0" cy="-26" r="7.2" fill="${color}"/>
    <path d="${pose}" stroke="${color}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </g>`;
const POSE_STAND = "M0 -19 V4 M0 -13 L-9 -2 M0 -13 L9 -2 M0 4 L-7 18 M0 4 L7 18";
const POSE_WALK = "M0 -19 V3 M0 -13 L-9 -3 M0 -13 L10 -8 M0 3 L-9 17 M0 3 L8 17";
const POSE_POINT = "M0 -19 V4 M0 -12 L14 -16 M0 -12 L-8 -2 M0 4 L-7 18 M0 4 L7 18";
const POSE_REACH = "M0 -19 V4 M0 -12 L-13 -20 M0 -12 L-12 -5 M0 4 L-7 18 M0 4 L7 18"; // 두 팔을 왼쪽으로(안기)

/* 배경 카드 그라데이션(장면 공용), 라즈베리 크림 톤(단원 액센트 #C2255C 계열) */
const BG = `<linearGradient id="h5-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FEF6FA"/><stop offset=".55" stop-color="#FBE9F1"/><stop offset="1" stop-color="#F5D6E3"/></linearGradient>`;
const CARD = `<rect x="10" y="8" width="340" height="184" rx="16" fill="url(#h5-bg)"/>`;
const SPRING = "var(--spring, cubic-bezier(.34,1.35,.5,1))";
const EASE = "cubic-bezier(.22,1,.36,1)";

/* 1 photoedit: 사진 편집 핸들, 모서리(비율 유지) vs 변(한 방향만) 늘리기 */
export const renderPhotoedit: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  // 선택 테두리+핸들 8개 세트(원본/1.5배/가로 1.8배), 크로스페이드로 교체
  const hs = (id: string, x0: number, y0: number, x1: number, y1: number, hidden: boolean): string => {
    const cx = (x0 + x1) / 2;
    const cy = (y0 + y1) / 2;
    const pts: Array<[number, number]> = [[x0, y0], [cx, y0], [x1, y0], [x0, cy], [x1, cy], [x0, y1], [cx, y1], [x1, y1]];
    return `<g id="${id}" style="opacity:${hidden ? 0 : 1}; transition: opacity .45s">
      <rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="none" stroke="#4C8FE0" stroke-width="1.5" stroke-dasharray="6 4"/>
      ${pts.map(([px, py]) => `<rect x="${px - 3.2}" y="${py - 3.2}" width="6.4" height="6.4" rx="1.5" fill="#FFFFFF" stroke="#3D7BD9" stroke-width="1.5"/>`).join("")}
    </g>`;
  };
  fig.innerHTML = wrapSvg(
    `${CARD}
    ${SHADOW(180, 186, 120, 0.1)}
    <rect x="42" y="18" width="276" height="164" rx="12" fill="url(#pe5-app)" stroke="#C8CFDA" stroke-width="1.6"/>
    <circle cx="58" cy="31" r="3.4" fill="#F26D6D"/><circle cx="72" cy="31" r="3.4" fill="#F2C14E"/><circle cx="86" cy="31" r="3.4" fill="#7BC77E"/>
    <line x1="42" y1="44" x2="318" y2="44" stroke="#E2E7EF" stroke-width="1.6"/>
    <g id="pe5-photo" style="transform-box: view-box; transform-origin: 180px 112px; transition: transform .85s ${SPRING}">
      <g clip-path="url(#pe5-clip)">
        <rect x="136" y="80" width="88" height="64" fill="url(#pe5-sky)"/>
        <circle cx="152" cy="92" r="6.5" fill="url(#pe5-sun)"/>
        <path d="M136 130 q20 -14 42 -3 q22 11 46 1 L224 144 L136 144 Z" fill="url(#pe5-hill)"/>
        <circle cx="197" cy="103" r="8.5" fill="#243040"/>
        <path d="M184 127 q13 -12 26 -1 M205 116 l9 -9" stroke="#243040" stroke-width="3.2" stroke-linecap="round" fill="none"/>
        <rect x="211" y="100" width="7" height="12" rx="1.5" fill="#33475C" transform="rotate(24 214 106)"/>
        <ellipse cx="152" cy="86" rx="10" ry="3" fill="#fff" opacity=".45" transform="rotate(-14 152 86)"/>
      </g>
      <rect x="136" y="80" width="88" height="64" fill="none" stroke="#FFFFFF" stroke-width="4"/>
      <rect x="134" y="78" width="92" height="68" fill="none" stroke="#E3C7D4" stroke-width="1.2"/>
    </g>
    ${hs("pe5-h0", 136, 80, 224, 144, false)}
    ${hs("pe5-h1", 114, 64, 246, 160, true)}
    ${hs("pe5-h2", 61, 64, 299, 160, true)}`,
    `${BG}
    <clipPath id="pe5-clip"><rect x="136" y="80" width="88" height="64" rx="2"/></clipPath>
    <linearGradient id="pe5-app" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".6" stop-color="#F7F9FC"/><stop offset="1" stop-color="#EEF2F7"/></linearGradient>
    <linearGradient id="pe5-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C4E5FB"/><stop offset=".55" stop-color="#93CAF2"/><stop offset="1" stop-color="#68ACE2"/></linearGradient>
    <radialGradient id="pe5-sun" cx=".38" cy=".32" r="1"><stop offset="0" stop-color="#FFF3C4"/><stop offset="1" stop-color="#FFCE4E"/></radialGradient>
    <linearGradient id="pe5-hill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A8D98A"/><stop offset=".6" stop-color="#7CBE64"/><stop offset="1" stop-color="#569E46"/></linearGradient>`,
  );
  const btn = mkBtn("모서리로 늘리기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "발표 자료의 <b>사진</b>이 너무 작아요. 편집 화면엔 모서리 핸들과 변 핸들이 있죠. 하나씩 당겨 볼까요?";

  let stage = 0;
  btn.addEventListener("click", () => {
    haptic(HAPTIC.select);
    if (stage === 0) {
      stage = 1;
      q<SVGGElement>(fig, "#pe5-photo").style.transform = "scale(1.5)";
      q<SVGGElement>(fig, "#pe5-h0").style.opacity = "0";
      q<SVGGElement>(fig, "#pe5-h1").style.opacity = "1";
      window.setTimeout(() => {
        face("smile");
        helper.innerHTML = "1.5배 커졌는데 <b>모양은 그대로</b>예요! 이번엔 변 핸들 차례예요. 옆으로 당겨 볼까요?";
        haptic(HAPTIC.tap);
      }, 950);
      btn.querySelector("span")!.textContent = "변으로 늘리기";
      return;
    }
    if (stage === 1) {
      stage = 2;
      btn.disabled = true;
      btn.classList.remove("pulse");
      q<SVGGElement>(fig, "#pe5-photo").style.transform = "scale(2.7, 1.5)";
      q<SVGGElement>(fig, "#pe5-h1").style.opacity = "0";
      q<SVGGElement>(fig, "#pe5-h2").style.opacity = "1";
      window.setTimeout(() => {
        face("surprised");
        helper.innerHTML = "으악, 얼굴이 넓적하게 찌그러졌어요! 모서리로 늘리면 안 찌그러지는 비밀은 뭘까요?";
        ask(box, helper, {
          choices: choices ?? [
            "가로와 세로를 같은 비율로 늘려서요",
            "모서리 쪽 화질이 더 좋아서요",
            "사진이 커질 때는 원래 안 찌그러져서요",
          ],
          good: "정확해요! 모서리 핸들은 가로·세로를 <b>같은 비율</b>로 늘려요. 그래서 모양이 그대로죠. 이렇게 일정한 비율로 늘이고 줄인 도형들의 관계, 오늘의 주인공이에요.",
          bad: "화질도 방향도 아니에요. 비밀은 <b>비율</b>, 모서리 핸들은 가로와 세로를 같은 비율로 늘려서 모양이 안 깨져요. 변 핸들은 한 방향만 늘려서 찌그러지고요. 직접 확대 복사기에서 확인해 봐요!",
          onDone: finish,
        });
      }, 1000);
    }
  });
};

/* 2 papersize: A4를 반으로 접어도 생김새가 같다(닮음이 유지되는 특별한 설계) */
export const renderPapersize: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  const CX = 168;
  const CY = 102;
  const paper = (id: string, w: number, h: number, hidden: boolean): string => {
    const x = CX - w / 2;
    const y = CY - h / 2;
    let lines = "";
    for (let i = 0; i < 4; i++) {
      const ly = y + h * 0.22 + i * h * 0.17;
      lines += `<line x1="${x + w * 0.12}" y1="${ly}" x2="${x + w * 0.88}" y2="${ly}" stroke="#C4CEDA" stroke-width="${i === 0 ? 2.6 : 1.8}" stroke-linecap="round"/>`;
    }
    return `<g id="${id}" style="opacity:${hidden ? 0 : 1}; transition: opacity .45s">
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="url(#pp5-paper)" stroke="#C9CFD8" stroke-width="1.4"/>
      ${lines}
      <ellipse cx="${x + w * 0.28}" cy="${y + 7}" rx="${w * 0.2}" ry="3" fill="#fff" opacity=".6"/>
    </g>`;
  };
  const outline = (id: string, w: number, h: number, label: string): string => {
    const x = CX - w / 2;
    const y = CY - h / 2;
    return `<g id="${id}" style="opacity:0; transition: opacity .5s">
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="none" stroke="#D486A8" stroke-width="1.6" stroke-dasharray="5 4"/>
      <text x="${x + 1}" y="${y - 4}" font-size="9.5" font-weight="800" fill="#C77A9C">${label}</text>
    </g>`;
  };
  fig.innerHTML = wrapSvg(
    `${CARD}
    <ellipse id="pp5-sh" cx="168" cy="164" rx="62" ry="5" fill="#2A3A5E" opacity=".1"/>
    ${outline("pp5-o4", 82, 116, "A4")}
    ${outline("pp5-o5", 58, 82, "A5")}
    ${paper("pp5-p4", 82, 116, false)}
    ${paper("pp5-p5", 58, 82, true)}
    ${paper("pp5-p6", 41, 58, true)}
    <g>
      <rect x="262" y="26" width="64" height="30" rx="10" fill="#FFFFFF" stroke="#EBC7D6" stroke-width="1.4"/>
      <text id="pp5-tag" x="294" y="46" text-anchor="middle" font-size="13" font-weight="900" fill="#C2255C">A4</text>
    </g>`,
    `${BG}
    <linearGradient id="pp5-paper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".6" stop-color="#F4F6F9"/><stop offset="1" stop-color="#E9EDF2"/></linearGradient>`,
  );
  const btn = mkBtn("반으로 접기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "시험지 <b>A4 용지</b>예요. 반으로 접으면 어떤 모양이 될까요? 접어 봐요!";

  let stage = 0;
  btn.addEventListener("click", () => {
    haptic(HAPTIC.select);
    if (stage === 0) {
      stage = 1;
      q<SVGGElement>(fig, "#pp5-p4").style.opacity = "0";
      q<SVGGElement>(fig, "#pp5-o4").style.opacity = "1";
      window.setTimeout(() => {
        q<SVGGElement>(fig, "#pp5-p5").style.opacity = "1";
        q<SVGTextElement>(fig, "#pp5-tag").textContent = "A5";
        const sh = q<SVGEllipseElement>(fig, "#pp5-sh");
        sh.setAttribute("cy", "147");
        sh.setAttribute("rx", "46");
        haptic(HAPTIC.tap);
      }, 200);
      window.setTimeout(() => {
        helper.innerHTML = "반 접으니 <b>A5</b>! 점선이 방금 전 크기예요. 한 번 더 접어 봐요.";
      }, 700);
      return;
    }
    if (stage === 1) {
      stage = 2;
      btn.disabled = true;
      btn.classList.remove("pulse");
      q<SVGGElement>(fig, "#pp5-p5").style.opacity = "0";
      q<SVGGElement>(fig, "#pp5-o5").style.opacity = "1";
      window.setTimeout(() => {
        q<SVGGElement>(fig, "#pp5-p6").style.opacity = "1";
        q<SVGTextElement>(fig, "#pp5-tag").textContent = "A6";
        const sh = q<SVGEllipseElement>(fig, "#pp5-sh");
        sh.setAttribute("cy", "135");
        sh.setAttribute("rx", "34");
        haptic(HAPTIC.tap);
      }, 200);
      window.setTimeout(() => {
        face("curious");
        helper.innerHTML = "점점 작아지는데 생김새는 그대로 같아 보여요. 그럼 세상 모든 직사각형이 서로 닮은 걸까요?";
        ask(box, helper, {
          choices: choices ?? [
            "아니요, 가로세로 비율이 같은 직사각형끼리만요",
            "네, 직사각형은 전부 서로 닮았어요",
            "종이처럼 얇은 것만 닮을 수 있어요",
          ],
          good: "날카로워요! 신용카드와 A4는 둘 다 직사각형이지만 모양이 다르죠. A 시리즈 용지는 반으로 접어도 <b>가로세로 비율이 유지되도록</b> 특별히 설계된 규격이라 서로 닮음이에요. 어떤 도형이 '항상' 닮음인지, 반례 사냥으로 가려내 봐요!",
          bad: "직사각형이라고 다 닮은 건 아니에요. 길쭉한 영수증과 네모난 메모지를 떠올려 봐요, 둘 다 직사각형이지만 모양이 다르죠. A 시리즈 용지가 특별한 거예요. 반으로 접어도 비율이 유지되게 설계됐거든요. 어떤 도형이 '항상' 닮음인지 사냥하러 가요!",
          onDone: finish,
        });
      }, 1100);
    }
  });
};

/* 3 jumbobear: 키만 2배인 점보 곰인형이 8배 무거운 이유(부피는 세제곱) */
export const renderJumbobear: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  const bear = (x: number, y: number, s: number): string =>
    `<g transform="translate(${x} ${y}) scale(${s})">
      <ellipse cx="-15" cy="-30" rx="6" ry="11" fill="url(#jb5-fur)" stroke="#5C3A1E" stroke-width="1.4" transform="rotate(18 -15 -30)"/>
      <ellipse cx="15" cy="-30" rx="6" ry="11" fill="url(#jb5-fur)" stroke="#5C3A1E" stroke-width="1.4" transform="rotate(-18 15 -30)"/>
      <ellipse cx="-8" cy="-6" rx="6.5" ry="7" fill="url(#jb5-fur)" stroke="#5C3A1E" stroke-width="1.4"/>
      <ellipse cx="8" cy="-6" rx="6.5" ry="7" fill="url(#jb5-fur)" stroke="#5C3A1E" stroke-width="1.4"/>
      <ellipse cx="0" cy="-24" rx="17" ry="20" fill="url(#jb5-fur)" stroke="#5C3A1E" stroke-width="1.6"/>
      <ellipse cx="0" cy="-21" rx="9.5" ry="12" fill="#EFD3A8" opacity=".9"/>
      <circle cx="-10" cy="-60" r="5.5" fill="url(#jb5-fur)" stroke="#5C3A1E" stroke-width="1.4"/>
      <circle cx="10" cy="-60" r="5.5" fill="url(#jb5-fur)" stroke="#5C3A1E" stroke-width="1.4"/>
      <circle cx="-10" cy="-60" r="2.6" fill="#EFD3A8"/>
      <circle cx="10" cy="-60" r="2.6" fill="#EFD3A8"/>
      <circle cx="0" cy="-50" r="14" fill="url(#jb5-fur)" stroke="#5C3A1E" stroke-width="1.6"/>
      <ellipse cx="0" cy="-45" rx="6.5" ry="5" fill="#F4DDB6"/>
      <circle cx="0" cy="-47.5" r="2" fill="#4A2C12"/>
      <path d="M0 -45.5 v3 M-2.5 -41.5 q2.5 2 5 0" stroke="#4A2C12" stroke-width="1.3" stroke-linecap="round" fill="none"/>
      <circle cx="-5.5" cy="-52" r="1.7" fill="#2E1A0A"/>
      <circle cx="5.5" cy="-52" r="1.7" fill="#2E1A0A"/>
      <ellipse cx="-6" cy="-57" rx="4.5" ry="2.2" fill="#fff" opacity=".35" transform="rotate(-18 -6 -57)"/>
    </g>`;
  fig.innerHTML = wrapSvg(
    `${CARD}
    <path d="M10 156 H350 V176 Q350 192 334 192 H26 Q10 192 10 176 Z" fill="url(#jb5-floor)"/>
    ${SHADOW(64, 158, 26, 0.12)}
    ${SHADOW(170, 160, 50, 0.12)}
    ${SHADOW(246, 159, 22, 0.11)}
    ${bear(64, 156, 0.8)}
    <g id="jb5-hug" style="transform-box: view-box; transform-origin: 246px 156px; transition: transform .7s ${SPRING}">
      <g id="jb5-jumbo" style="transition: transform .55s ${EASE}">${bear(170, 156, 1.6)}</g>
      ${stick(246, 156, 1, POSE_REACH)}
    </g>
    <g id="jb5-sweat" style="opacity:0; transition: opacity .45s">
      <path d="M260 112 q3 5 0 8 q-3 -3 0 -8" fill="#79B8F2" stroke="#2B79C0" stroke-width="1"/>
      <path d="M267 124 q3 5 0 8 q-3 -3 0 -8" fill="#79B8F2" stroke="#2B79C0" stroke-width="1"/>
    </g>
    <text x="64" y="182" text-anchor="middle" font-size="10.5" font-weight="800" fill="#8A5A6E">보통</text>
    <text x="170" y="182" text-anchor="middle" font-size="10.5" font-weight="800" fill="#8A5A6E">점보(키 2배)</text>`,
    `${BG}
    <linearGradient id="jb5-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F5E0EA"/><stop offset="1" stop-color="#EACBDA"/></linearGradient>
    <linearGradient id="jb5-fur" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D29E66"/><stop offset=".55" stop-color="#B57E44"/><stop offset="1" stop-color="#92602C"/></linearGradient>`,
  );
  const btn = mkBtn("점보 들어 보기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "인형 가게의 <b>점보 곰인형</b>, 보통 인형과 생김새가 똑같고 키만 2배예요. 한번 들어 볼까요?";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    q<SVGGElement>(fig, "#jb5-jumbo").style.transform = "translate(8px, -14px)";
    window.setTimeout(() => {
      q<SVGGElement>(fig, "#jb5-hug").style.transform = "rotate(8deg)";
    }, 420);
    window.setTimeout(() => {
      q<SVGGElement>(fig, "#jb5-sweat").style.opacity = "1";
      haptic(HAPTIC.wrong);
    }, 750);
    window.setTimeout(() => {
      face("surprised");
      helper.innerHTML = "키만 2배인데 왜 이렇게 무거울까요? 솜이 몇 배나 들었을까요?";
      ask(box, helper, {
        choices: choices ?? [
          "8배쯤이요, 키·너비·두께가 전부 2배씩이니까요",
          "2배요, 키가 2배니까 솜도 2배죠",
          "4배쯤이요, 가로세로가 2배씩이니까요",
        ],
        good: "정확해요! 같은 모양으로 커지면 키만이 아니라 너비도 두께도 2배가 돼요. 그래서 솜(부피)은 2×2×2=8배! 겉감 천은 2×2=4배가 들죠. 사본 채우기로 직접 세어 봐요.",
        bad: "들어 보면 2배보다 훨씬 무거워요. 같은 모양으로 커지면 키·너비·두께가 <b>전부</b> 2배가 되거든요. 솜(부피)은 2×2×2=8배, 겉감 천(겉넓이)은 2×2=4배예요. 직접 세어 보면 확실해져요!",
        onDone: finish,
      });
    }, 1150);
  });
};

/* 4 triruler: 크기가 달라도 딱 포개지는 삼각자(각이 모양을 결정한다) */
export const renderTriruler: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  // 직각삼각형 삼각자: 로컬 A(0,0) B(w,0) C(w,-0.62w), 구멍은 (0.66w,-0.2w)
  const tri = (w: number, grad: string): string =>
    `<path d="M0 0 L${w} 0 L${w} ${-0.62 * w} Z" fill="url(#${grad})" fill-opacity=".85" stroke="#8C2F52" stroke-width="1.8" stroke-linejoin="round"/>
    <circle cx="${0.66 * w}" cy="${-0.2 * w}" r="${0.09 * w}" fill="#F3E1C4" stroke="#A03A62" stroke-width="1.2"/>
    <ellipse cx="${0.55 * w}" cy="${-0.09 * w}" rx="${0.15 * w}" ry="${0.045 * w}" fill="#fff" opacity=".3" transform="rotate(-16 ${0.55 * w} ${-0.09 * w})"/>`;
  fig.innerHTML = wrapSvg(
    `${CARD}
    <path d="M10 34 H350 V176 Q350 192 334 192 H26 Q10 192 10 176 Z" fill="url(#tr5-desk)"/>
    <line x1="10" y1="34" x2="350" y2="34" stroke="#C09A62" stroke-width="1.4" opacity=".7"/>
    <path d="M30 70 q80 8 150 2 q90 -7 160 3" stroke="#D9B77F" stroke-width="1.4" fill="none" opacity=".45"/>
    <path d="M20 132 q90 9 170 3 q80 -6 150 2" stroke="#D9B77F" stroke-width="1.4" fill="none" opacity=".4"/>
    <g id="tr5-scatter" style="opacity:1; transition: opacity .45s">
      ${SHADOW(240, 178, 70, 0.1)}
      ${SHADOW(190, 122, 52, 0.1)}
      ${SHADOW(88, 120, 36, 0.1)}
      <g transform="translate(176 176) rotate(-5)">${tri(150, "tr5-pl3")}</g>
      <g transform="translate(140 104) rotate(8)">${tri(116, "tr5-pl2")}</g>
      <g transform="translate(52 118) rotate(-14)">${tri(78, "tr5-pl1")}</g>
    </g>
    <g id="tr5-stack" style="opacity:0; transition: opacity .55s">
      ${SHADOW(172, 162, 84, 0.11)}
      <g transform="translate(92 158)">${tri(150, "tr5-pl3")}</g>
      <g transform="translate(92 158)">${tri(116, "tr5-pl2")}</g>
      <g transform="translate(92 158)">${tri(78, "tr5-pl1")}</g>
    </g>
    <g id="tr5-arcs" style="opacity:0; transition: opacity .5s">
      <path d="M114 158 A22 22 0 0 0 110.7 146.4" stroke="#E8A93E" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M122 158 A30 30 0 0 0 117.5 142.2" stroke="#E8A93E" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M130 158 A38 38 0 0 0 124.3 138" stroke="#E8A93E" stroke-width="2.6" stroke-linecap="round"/>
      <circle cx="92" cy="158" r="4" fill="#E8A93E"/>
    </g>`,
    `${BG}
    <linearGradient id="tr5-desk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6E7CE"/><stop offset=".55" stop-color="#EAD3AC"/><stop offset="1" stop-color="#DDBE8E"/></linearGradient>
    <linearGradient id="tr5-pl1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6BED5"/><stop offset=".55" stop-color="#EE8FB6"/><stop offset="1" stop-color="#E36A9C"/></linearGradient>
    <linearGradient id="tr5-pl2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EE9FC0"/><stop offset=".55" stop-color="#E36A9C"/><stop offset="1" stop-color="#D14B84"/></linearGradient>
    <linearGradient id="tr5-pl3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E37FAB"/><stop offset=".55" stop-color="#D14B84"/><stop offset="1" stop-color="#B93A6E"/></linearGradient>`,
  );
  const btn = mkBtn("겹쳐 보기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "문방구 <b>삼각자</b>는 크기가 제각각인데, 어느 가게에서 사도 생김새는 딱 두 종류뿐이에요. 겹쳐 볼까요?";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    q<SVGGElement>(fig, "#tr5-scatter").style.opacity = "0";
    window.setTimeout(() => {
      q<SVGGElement>(fig, "#tr5-stack").style.opacity = "1";
    }, 320);
    window.setTimeout(() => {
      q<SVGGElement>(fig, "#tr5-arcs").style.opacity = "1";
      haptic(HAPTIC.tap);
    }, 950);
    window.setTimeout(() => {
      face("curious");
      helper.innerHTML = "크기가 달라도 딱 포개져요. 모양이 딱 정해져 있는 비밀은 뭘까요?";
      ask(box, helper, {
        choices: choices ?? [
          "세 각의 크기가 정해져 있어서요, 각이 같으면 모양이 같거든요",
          "같은 공장에서 만들어서요",
          "플라스틱이 늘어나지 않아서요",
        ],
        good: "맞아요! 삼각자는 각이 규격으로 정해져 있어요. 각이 같으면 크기와 상관없이 모양이 똑같죠. 그런데 정말 각만으로 모양이 정해질까요? 몇 개의 정보면 충분한지, 공방에서 실험해 봐요.",
        bad: "공장도 재질도 아니에요. 비밀은 <b>각</b>이에요. 삼각자는 세 각의 크기가 규격으로 정해져 있어서, 크기가 달라도 모양이 똑같아요. 정보 몇 개면 모양이 확정되는지 공방에서 직접 확인해 봐요!",
        onDone: finish,
      });
    }, 1450);
  });
};

/* 5 streetlamp: 가로등 그림자, 물러날수록 길어지는 그림자 속 숨은 닮음 삼각형 */
export const renderStreetlamp: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  // 광원 L=(62,48), 사람 키 33(발 158, 머리 끝 125), 그림자 끝은 닮음비로 계산(모두 한 직선 위)
  fig.innerHTML = wrapSvg(
    `<rect x="10" y="8" width="340" height="184" rx="16" fill="url(#sl5-night)"/>
    <circle cx="150" cy="30" r="1.8" fill="#EAF2FF" opacity=".7"/><circle cx="216" cy="20" r="1.4" fill="#EAF2FF" opacity=".55"/>
    <circle cx="286" cy="34" r="2" fill="#EAF2FF" opacity=".75"/><circle cx="322" cy="66" r="1.4" fill="#EAF2FF" opacity=".5"/>
    <circle cx="252" cy="52" r="1.5" fill="#EAF2FF" opacity=".6"/>
    <path d="M10 150 H350 V176 Q350 192 334 192 H26 Q10 192 10 176 Z" fill="url(#sl5-ground)"/>
    ${SHADOW(62, 156, 20, 0.28)}
    <rect x="58" y="48" width="7" height="104" rx="3" fill="url(#sl5-pole)" stroke="#0B1220" stroke-width="1.3"/>
    <path d="M50 48 L74 48 L69 36 L55 36 Z" fill="#33404E" stroke="#0B1220" stroke-width="1.2"/>
    <circle cx="62" cy="52" r="26" fill="url(#sl5-glow)"/>
    <ellipse cx="62" cy="49" rx="9" ry="5" fill="#FFE9A8" stroke="#C9A03E" stroke-width="1"/>
    <ellipse id="sl5-sh" cx="168.9" cy="160.5" rx="18.9" ry="3.6" fill="#05080F" opacity=".6"/>
    <g id="sl5-man" style="transition: transform .8s ${EASE}">${stick(150, 158, 1, POSE_STAND, "#E8EFF8")}</g>
    <g id="sl5-tris" style="opacity:0; transition: opacity .6s">
      <path d="M62 48 L62 158 L302 158 Z" fill="#4C8FE0" opacity=".14"/>
      <path d="M62 48 L62 158 L302 158 Z" stroke="#7FB3F0" stroke-width="1.6" fill="none"/>
      <path d="M230 125 L230 158 L302 158 Z" fill="#F06292" opacity=".22"/>
      <path d="M230 125 L230 158 L302 158 Z" stroke="#F48FB1" stroke-width="1.6" fill="none"/>
    </g>
    <path id="sl5-ray" d="M62 48 L302 158" stroke="#FFE28A" stroke-width="2.4" stroke-dasharray="7 5" stroke-linecap="round" opacity="0" style="transition: opacity .55s"/>`,
    `<linearGradient id="sl5-night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#223457"/><stop offset=".55" stop-color="#15223C"/><stop offset="1" stop-color="#0C1526"/></linearGradient>
    <linearGradient id="sl5-ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#26324E"/><stop offset="1" stop-color="#182237"/></linearGradient>
    <linearGradient id="sl5-pole" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6E7C8C"/><stop offset=".5" stop-color="#4A5866"/><stop offset="1" stop-color="#333F4C"/></linearGradient>
    <radialGradient id="sl5-glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFE9A8" stop-opacity=".8"/><stop offset=".6" stop-color="#FFD98A" stop-opacity=".28"/><stop offset="1" stop-color="#FFD98A" stop-opacity="0"/></radialGradient>`,
  );
  const btn = mkBtn("한 걸음 물러나기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "밤길 <b>가로등</b> 아래 스틱맨이 서 있어요. 뒤로 물러나면 그림자가 어떻게 될까요?";

  const sh = q<SVGEllipseElement>(fig, "#sl5-sh");
  const tween = (f0: number, f1: number, t0: number, t1: number): void => {
    for (let i = 1; i <= 12; i++) {
      window.setTimeout(() => {
        const t = i / 12;
        const e = 1 - Math.pow(1 - t, 2);
        const feet = f0 + (f1 - f0) * e;
        const tip = t0 + (t1 - t0) * e;
        sh.setAttribute("cx", String((feet + tip) / 2));
        sh.setAttribute("rx", String((tip - feet) / 2));
      }, i * 66);
    }
  };
  let stage = 0;
  btn.addEventListener("click", () => {
    haptic(HAPTIC.select);
    if (stage === 0) {
      stage = 1;
      q<SVGGElement>(fig, "#sl5-man").style.transform = "translate(40px, 0px)";
      tween(150, 190, 187.7, 244.9);
      window.setTimeout(() => {
        helper.innerHTML = "그림자가 <b>길어졌어요!</b> 한 걸음 더 물러나 볼까요?";
        haptic(HAPTIC.tap);
      }, 900);
      return;
    }
    if (stage === 1) {
      stage = 2;
      btn.disabled = true;
      btn.classList.remove("pulse");
      q<SVGGElement>(fig, "#sl5-man").style.transform = "translate(80px, 0px)";
      tween(190, 230, 244.9, 302);
      window.setTimeout(() => {
        q<SVGPathElement>(fig, "#sl5-ray").style.opacity = ".9";
      }, 1000);
      window.setTimeout(() => {
        q<SVGGElement>(fig, "#sl5-tris").style.opacity = "1";
        haptic(HAPTIC.tap);
      }, 1500);
      window.setTimeout(() => {
        face("curious");
        helper.innerHTML = "빛 직선 아래 삼각형이 두 개 보여요. 큰 것과 작은 것, 어떤 관계일까요?";
        ask(box, helper, {
          choices: choices ?? [
            "서로 닮음이에요, 빛 직선과 바닥이 만드는 각이 같거든요",
            "합동이에요, 완전히 똑같은 삼각형이죠",
            "우연히 겹쳐 보일 뿐 아무 관계 없어요",
          ],
          good: "정확해요! 두 삼각형은 바닥과 직각, 그리고 빛 직선이 만드는 같은 각을 공유해요. 각 두 개가 같으니 닮음이죠. 이렇게 한 그림에 겹쳐 숨은 닮음을 찾는 눈, 오늘 길러 봐요.",
          bad: "크기가 다르니 합동은 아니에요. 하지만 아무 관계가 없는 것도 아니죠. 두 삼각형은 바닥과 이루는 직각, 빛 직선이 만드는 각을 공유해요. 각 두 개가 같으면 닮음! 겹친 그림에서 닮음을 찾아내는 연습을 해 봐요.",
          onDone: finish,
        });
      }, 2100);
    }
  });
};

/* 6 hillroad: 산기슭과 나란한 중턱 산책로, 높이 절반이면 폭도 절반 */
export const renderHillroad: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  // 산: 꼭대기(180,34), 기슭(52,168)~(308,168). 중턱 길 y=101: (116,101)~(244,101)
  fig.innerHTML = wrapSvg(
    `${CARD}
    <path d="M180 34 L52 168 L308 168 Z" fill="url(#hr5-mount)" stroke="#2E6B46" stroke-width="2" stroke-linejoin="round"/>
    <path d="M150 66 q10 14 2 30 M206 84 q-8 16 2 32" stroke="#BCE3A8" stroke-width="2" fill="none" opacity=".4" stroke-linecap="round"/>
    <ellipse cx="152" cy="72" rx="16" ry="6" fill="#fff" opacity=".22" transform="rotate(-38 152 72)"/>
    <line x1="180" y1="34" x2="180" y2="16" stroke="#6E4A2A" stroke-width="2"/>
    <path d="M180 16 L198 22 L180 28 Z" fill="url(#hr5-flag)" stroke="#A03A2A" stroke-width="1.2" stroke-linejoin="round"/>
    <line x1="148" y1="68" x2="212" y2="68" stroke="#EAD7A9" stroke-width="5" stroke-linecap="round"/>
    <line x1="116" y1="101" x2="244" y2="101" stroke="#EAD7A9" stroke-width="6" stroke-linecap="round"/>
    <line x1="120" y1="101" x2="240" y2="101" stroke="#C9A96A" stroke-width="1.4" stroke-dasharray="4 5"/>
    <g>
      <rect x="150" y="170" width="60" height="18" rx="8" fill="#FFFFFF" stroke="#EBC7D6" stroke-width="1.4"/>
      <text x="180" y="183" text-anchor="middle" font-size="11" font-weight="900" fill="#C2255C">600m</text>
    </g>
    <g id="hr5-man" style="opacity:0; transition: opacity .4s, transform 1.7s linear">${stick(116, 101, 0.66, POSE_WALK)}</g>
    <g id="hr5-q" style="opacity:0; transition: opacity .5s">
      <g>
        <animate attributeName="opacity" values="1;.35;1" dur="1.1s" repeatCount="indefinite"/>
        <rect x="164" y="76" width="32" height="20" rx="8" fill="#FFF7E0" stroke="#E8B93E" stroke-width="1.6"/>
        <text x="180" y="90" text-anchor="middle" font-size="12" font-weight="900" fill="#B4831E">?</text>
      </g>
    </g>`,
    `${BG}
    <linearGradient id="hr5-mount" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8FD08A"/><stop offset=".55" stop-color="#57A85E"/><stop offset="1" stop-color="#2F7A46"/></linearGradient>
    <linearGradient id="hr5-flag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F98C7E"/><stop offset="1" stop-color="#D9503C"/></linearGradient>`,
  );
  const btn = mkBtn("중턱 길 걷기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "삼각형 모양 산이에요. 산기슭 폭은 <b>600m</b>, 산책로는 산기슭과 <b>나란하게</b> 나 있어요. 높이 딱 절반 지점의 중턱 길을 걸어 볼까요?";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    const man = q<SVGGElement>(fig, "#hr5-man");
    man.style.opacity = "1";
    window.setTimeout(() => {
      man.style.transform = "translate(128px, 0px)";
    }, 180);
    window.setTimeout(() => {
      q<SVGGElement>(fig, "#hr5-q").style.opacity = "1";
      haptic(HAPTIC.tap);
    }, 1950);
    window.setTimeout(() => {
      face("curious");
      helper.innerHTML = "높이 절반 지점의 산책로, 길이는 얼마일까요?";
      ask(box, helper, {
        choices: choices ?? [
          "300m요, 높이가 절반이면 폭도 절반이 돼요",
          "600m요, 걷는 거리는 어디든 같아요",
          "450m요, 조금만 줄어들어요",
        ],
        good: "정확해요! 산책로가 산기슭과 평행하면 작은 산(위쪽)과 원래 산이 닮음이 돼요. 높이가 절반이니 폭도 절반, 300m죠. 평행선이 삼각형을 자르면 어떤 비가 생기는지 슬라이서로 실험해 봐요.",
        bad: "산은 위로 갈수록 좁아지죠. 산책로가 산기슭과 평행하면 위쪽의 작은 산과 원래 산은 닮음이라, 높이가 절반이면 폭도 정확히 절반인 300m가 돼요. 감이 아니라 규칙이에요. 슬라이서로 그 규칙을 재 봐요!",
        onDone: finish,
      });
    }, 2300);
  });
};

/* 7 grasscut: 잔디밭 중점 샛길 걷기 시합, 절반 시간에 도착(중점 연결의 씨앗) */
export const renderGrasscut: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  // 잔디밭 A(180,30) B(70,168) C(290,168), M=(125,99) N=(235,99)
  fig.innerHTML = wrapSvg(
    `${CARD}
    <path d="M180 30 L70 168 L290 168 Z" fill="url(#gc5-grass)" stroke="#2E6B3A" stroke-width="2" stroke-linejoin="round"/>
    <ellipse cx="150" cy="80" rx="22" ry="8" fill="#fff" opacity=".18" transform="rotate(-32 150 80)"/>
    <path d="M120 140 l3 -6 3 6 M200 120 l3 -6 3 6 M246 150 l3 -6 3 6" stroke="#BCE3A8" stroke-width="1.6" fill="none" opacity=".7"/>
    <line x1="125" y1="99" x2="235" y2="99" stroke="#D9B678" stroke-width="9" stroke-linecap="round"/>
    <line x1="129" y1="99" x2="231" y2="99" stroke="#A8823E" stroke-width="1.8" stroke-dasharray="5 5"/>
    <circle cx="125" cy="99" r="4" fill="#FFFFFF" stroke="#8C5A2E" stroke-width="1.6"/>
    <circle cx="235" cy="99" r="4" fill="#FFFFFF" stroke="#8C5A2E" stroke-width="1.6"/>
    <text x="112" y="95" font-size="10.5" font-weight="900" fill="#4A3A1E">M</text>
    <text x="242" y="95" font-size="10.5" font-weight="900" fill="#4A3A1E">N</text>
    <text x="180" y="22" text-anchor="middle" font-size="10.5" font-weight="900" fill="#8A5A6E">A</text>
    <text x="58" y="180" font-size="10.5" font-weight="900" fill="#8A5A6E">B</text>
    <text x="296" y="180" font-size="10.5" font-weight="900" fill="#8A5A6E">C</text>
    <g id="gc5-r1" style="transition: transform 1.4s linear">${stick(125, 99, 0.6, POSE_WALK)}</g>
    <g id="gc5-r2" style="transition: transform 2.8s linear">${stick(70, 168, 0.72, POSE_WALK)}</g>
    <g id="gc5-flag" style="transform-box: view-box; transform-origin: 238px 99px; transform: scale(0); transition: transform .45s ${SPRING}">
      <line x1="238" y1="99" x2="238" y2="77" stroke="#6E4A2A" stroke-width="2"/>
      <path d="M238 77 L254 82 L238 87 Z" fill="url(#gc5-flag-g)" stroke="#A03A2A" stroke-width="1.2" stroke-linejoin="round"/>
    </g>
    <g id="gc5-done" style="opacity:0; transition: opacity .4s">
      <rect x="186" y="64" width="46" height="18" rx="7" fill="#F0FBF5" stroke="#7ACB9E" stroke-width="1.3"/>
      <text x="209" y="77" text-anchor="middle" font-size="10" font-weight="900" fill="#1E7A31">도착!</text>
    </g>
    <g id="gc5-half" style="opacity:0; transition: opacity .4s">
      <rect x="146" y="138" width="68" height="18" rx="7" fill="#FFFFFF" stroke="#EBC7D6" stroke-width="1.3"/>
      <text x="180" y="151" text-anchor="middle" font-size="10" font-weight="900" fill="#C2255C">아직 절반</text>
    </g>`,
    `${BG}
    <linearGradient id="gc5-grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9AD489"/><stop offset=".55" stop-color="#5FAE5E"/><stop offset="1" stop-color="#357F44"/></linearGradient>
    <linearGradient id="gc5-flag-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F98C7E"/><stop offset="1" stop-color="#D9503C"/></linearGradient>`,
  );
  const btn = mkBtn("동시에 출발!");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "공원 삼각형 <b>잔디밭</b>이에요. 두 변의 <b>한가운데</b>(M과 N)를 잇는 흙 샛길이 나 있죠. 아랫길(B에서 C)과 걷기 시합을 해 볼까요?";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    const r1 = q<SVGGElement>(fig, "#gc5-r1");
    const r2 = q<SVGGElement>(fig, "#gc5-r2");
    r1.style.transform = "translate(110px, 0px)";
    r2.style.transform = "translate(220px, 0px)";
    window.setTimeout(() => {
      // 샛길 주자 도착 순간, 아랫길 주자를 절반 지점에 얼려 비교를 보여 준다(선형이라 스냅 없음)
      r2.style.transition = "none";
      r2.style.transform = "translate(110px, 0px)";
      q<SVGGElement>(fig, "#gc5-flag").style.transform = "scale(1)";
      haptic(HAPTIC.tap);
    }, 1400);
    window.setTimeout(() => {
      q<SVGGElement>(fig, "#gc5-done").style.opacity = "1";
      q<SVGGElement>(fig, "#gc5-half").style.opacity = "1";
    }, 1550);
    window.setTimeout(() => {
      face("surprised");
      helper.innerHTML = "샛길 스틱맨이 절반 시간 만에 도착했어요. 샛길 MN과 아랫길 BC의 관계는?";
      ask(box, helper, {
        choices: choices ?? [
          "나란하고, 길이는 정확히 절반이에요",
          "방향이 달라서 길이를 비교할 수 없어요",
          "절반보다 조금 길어요, 비스듬하니까요",
        ],
        good: "정확해요! 두 변의 중점을 이으면 아랫변과 <b>평행</b>하고 길이는 딱 <b>절반</b>이 돼요. 어떤 삼각형이든요. 정말 항상 그런지 중점을 직접 이어 확인해 봐요.",
        bad: "같은 속도로 절반 시간에 도착했으니 길이는 정확히 절반이에요. 게다가 샛길은 아랫길과 완벽하게 나란하죠. 중점 두 개를 이으면 평행과 절반이 공짜로 따라와요. 직접 이어서 확인해 봐요!",
        onDone: finish,
      });
    }, 1950);
  });
};

/* 8 letterfold: 3단 접기, 어림은 실패하고 공책 평행선 위에선 완벽한 3등분 */
export const renderLetterfold: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  // 공책 줄 4개(y=42·80·118·156, 간격 38). 기울인 편지지는 rotate(-35.5 118 99):
  // 길이 140 × cos35.5° = 114 = 줄 3칸 → 3등분 접선이 줄과 정확히 만난다(교점 (104.5,80)·(131.5,118))
  fig.innerHTML = wrapSvg(
    `${CARD}
    <g id="lf5-rules" style="opacity:0; transition: opacity .5s">
      <line x1="36" y1="42" x2="252" y2="42" stroke="#A9C3E0" stroke-width="1.8" opacity=".85"/>
      <line x1="36" y1="80" x2="252" y2="80" stroke="#A9C3E0" stroke-width="1.8" opacity=".85"/>
      <line x1="36" y1="118" x2="252" y2="118" stroke="#A9C3E0" stroke-width="1.8" opacity=".85"/>
      <line x1="36" y1="156" x2="252" y2="156" stroke="#A9C3E0" stroke-width="1.8" opacity=".85"/>
    </g>
    ${SHADOW(118, 174, 56, 0.1)}
    <g id="lf5-p1" style="opacity:1; transition: opacity .5s">
      <rect x="64" y="30" width="104" height="140" rx="2" fill="url(#lf5-paper)" stroke="#C9CFD8" stroke-width="1.4"/>
      <line x1="76" y1="52" x2="156" y2="52" stroke="#C4CEDA" stroke-width="2.6" stroke-linecap="round"/>
      <line x1="76" y1="68" x2="156" y2="68" stroke="#C4CEDA" stroke-width="1.8" stroke-linecap="round"/>
      <line x1="76" y1="84" x2="156" y2="84" stroke="#C4CEDA" stroke-width="1.8" stroke-linecap="round"/>
      <line x1="76" y1="100" x2="146" y2="100" stroke="#C4CEDA" stroke-width="1.8" stroke-linecap="round"/>
      <line x1="76" y1="116" x2="156" y2="116" stroke="#C4CEDA" stroke-width="1.8" stroke-linecap="round"/>
      <ellipse cx="92" cy="38" rx="16" ry="3" fill="#fff" opacity=".6"/>
      <g id="lf5-crease1" style="opacity:0; transition: opacity .45s">
        <line x1="68" y1="74" x2="164" y2="74" stroke="#8898AA" stroke-width="2" stroke-dasharray="5 4"/>
        <line x1="68" y1="135" x2="164" y2="135" stroke="#8898AA" stroke-width="2" stroke-dasharray="5 4"/>
      </g>
    </g>
    <g id="lf5-p2" style="opacity:0; transition: opacity .55s">
      <g transform="rotate(-35.5 118 99)">
        <rect x="66" y="29" width="104" height="140" rx="2" fill="url(#lf5-paper)" stroke="#C9CFD8" stroke-width="1.4"/>
        <line x1="78" y1="51" x2="158" y2="51" stroke="#C4CEDA" stroke-width="2.4" stroke-linecap="round"/>
        <line x1="78" y1="66" x2="158" y2="66" stroke="#C4CEDA" stroke-width="1.8" stroke-linecap="round"/>
        <line x1="78" y1="96" x2="158" y2="96" stroke="#C4CEDA" stroke-width="1.8" stroke-linecap="round"/>
        <line x1="78" y1="140" x2="150" y2="140" stroke="#C4CEDA" stroke-width="1.8" stroke-linecap="round"/>
        <g id="lf5-crease2" style="opacity:0; transition: opacity .5s">
          <line x1="72" y1="75.7" x2="164" y2="75.7" stroke="#2F9E5F" stroke-width="2.4"/>
          <line x1="72" y1="122.3" x2="164" y2="122.3" stroke="#2F9E5F" stroke-width="2.4"/>
        </g>
      </g>
    </g>
    <g id="lf5-dots" style="opacity:0; transition: opacity .45s">
      <circle cx="104.5" cy="80" r="4.5" fill="#F2C14E" stroke="#A87A1E" stroke-width="1.4"/>
      <circle cx="131.5" cy="118" r="4.5" fill="#F2C14E" stroke="#A87A1E" stroke-width="1.4"/>
    </g>
    <g id="lf5-pk2" style="opacity:0; transition: opacity .35s, transform .8s ${EASE}">
      <rect x="76" y="78" width="84" height="42" rx="3" fill="url(#lf5-paper)" stroke="#C9CFD8" stroke-width="1.4"/>
      <line x1="80" y1="92" x2="156" y2="92" stroke="#C4CEDA" stroke-width="1.6"/>
      <line x1="80" y1="106" x2="156" y2="106" stroke="#C4CEDA" stroke-width="1.6"/>
    </g>
    ${SHADOW(283, 156, 46, 0.11)}
    <rect x="238" y="96" width="90" height="56" rx="6" fill="url(#lf5-env)" stroke="#B5875A" stroke-width="1.6"/>
    <path d="M238 96 L283 74 L328 96 Z" fill="url(#lf5-flap)" stroke="#B5875A" stroke-width="1.4" stroke-linejoin="round"/>
    <line x1="246" y1="99" x2="320" y2="99" stroke="#8C6A3E" stroke-width="1.4" opacity=".55"/>
    <line x1="254" y1="126" x2="304" y2="126" stroke="#C9A470" stroke-width="1.8" stroke-linecap="round"/>
    <line x1="254" y1="136" x2="290" y2="136" stroke="#C9A470" stroke-width="1.8" stroke-linecap="round"/>
    <ellipse cx="256" cy="104" rx="12" ry="3" fill="#fff" opacity=".35"/>
    <g id="lf5-pk1" style="opacity:0; transition: opacity .35s, transform .8s ${EASE}">
      <rect x="74" y="72" width="84" height="56" rx="3" fill="url(#lf5-paper)" stroke="#C9CFD8" stroke-width="1.4"/>
      <line x1="78" y1="90" x2="154" y2="90" stroke="#C4CEDA" stroke-width="1.6"/>
      <line x1="78" y1="114" x2="154" y2="114" stroke="#C4CEDA" stroke-width="1.6"/>
    </g>
    <g id="lf5-x" style="opacity:0; transition: opacity .4s">
      <path d="M270 71 L296 97 M296 71 L270 97" stroke="#E03131" stroke-width="5" stroke-linecap="round"/>
    </g>
    <g id="lf5-ok" style="transform-box: view-box; transform-origin: 283px 88px; transform: scale(0); transition: transform .45s ${SPRING}">
      <circle cx="283" cy="88" r="11" fill="url(#lf5-okg)" stroke="#1E7A31" stroke-width="1.6"/>
      <path d="M277 88 l4.5 5 8 -10" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    </g>`,
    `${BG}
    <linearGradient id="lf5-paper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".6" stop-color="#F4F6F9"/><stop offset="1" stop-color="#E9EDF2"/></linearGradient>
    <linearGradient id="lf5-env" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2D8B4"/><stop offset=".55" stop-color="#E3BE8C"/><stop offset="1" stop-color="#CFA468"/></linearGradient>
    <linearGradient id="lf5-flap" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F8E4C4"/><stop offset="1" stop-color="#EBCB9A"/></linearGradient>
    <radialGradient id="lf5-okg" cx=".38" cy=".32" r="1"><stop offset="0" stop-color="#7ACB9E"/><stop offset="1" stop-color="#2F9E5F"/></radialGradient>`,
  );
  const btn = mkBtn("어림으로 접기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "<b>가정통신문</b>을 봉투에 넣으려면 3단 접기가 필요해요. 먼저 어림으로 접어 볼까요?";

  let stage = 0;
  btn.addEventListener("click", () => {
    haptic(HAPTIC.select);
    if (stage === 0) {
      stage = 1;
      q<SVGGElement>(fig, "#lf5-crease1").style.opacity = "1";
      const pk1 = q<SVGGElement>(fig, "#lf5-pk1");
      window.setTimeout(() => { pk1.style.opacity = "1"; }, 250);
      window.setTimeout(() => { pk1.style.transform = "translate(167px, -8px)"; }, 350);
      window.setTimeout(() => {
        q<SVGGElement>(fig, "#lf5-x").style.opacity = "1";
        haptic(HAPTIC.wrong);
        face("surprised");
      }, 1250);
      window.setTimeout(() => {
        helper.innerHTML = "이런! 접힌 폭이 <b>제각각</b>이라 봉투에 안 들어가요. 이번엔 공책 줄의 도움을 받아 볼까요?";
      }, 1450);
      btn.querySelector("span")!.textContent = "공책 줄에 대고 접기";
      return;
    }
    if (stage === 1) {
      stage = 2;
      btn.disabled = true;
      btn.classList.remove("pulse");
      q<SVGGElement>(fig, "#lf5-pk1").style.opacity = "0";
      q<SVGGElement>(fig, "#lf5-x").style.opacity = "0";
      q<SVGGElement>(fig, "#lf5-rules").style.opacity = "1";
      q<SVGGElement>(fig, "#lf5-p1").style.opacity = "0";
      window.setTimeout(() => { q<SVGGElement>(fig, "#lf5-p2").style.opacity = "1"; }, 350);
      window.setTimeout(() => { q<SVGGElement>(fig, "#lf5-dots").style.opacity = "1"; }, 900);
      window.setTimeout(() => {
        q<SVGGElement>(fig, "#lf5-crease2").style.opacity = "1";
        haptic(HAPTIC.tap);
      }, 1250);
      const pk2 = q<SVGGElement>(fig, "#lf5-pk2");
      window.setTimeout(() => { pk2.style.opacity = "1"; }, 1550);
      window.setTimeout(() => { pk2.style.transform = "translate(165px, 25px)"; }, 1650);
      window.setTimeout(() => {
        q<SVGGElement>(fig, "#lf5-ok").style.transform = "scale(1)";
        haptic(HAPTIC.select);
        face("smile");
      }, 2450);
      window.setTimeout(() => {
        helper.innerHTML = "공책 줄 위에 비스듬히 올렸을 뿐인데 완벽한 3등분이 됐어요. 비밀이 뭘까요?";
        ask(box, helper, {
          choices: choices ?? [
            "줄들이 평행하고 간격이 같아서, 비스듬한 종이도 같은 비로 잘라 줘요",
            "공책 줄이 자석처럼 종이를 반듯하게 당겨 줘서요",
            "종이를 딱 맞는 각도로 올렸을 때만 통하는 우연이에요",
          ],
          good: "정확해요! 간격이 같은 평행선 무리는 그 사이를 지나는 선분을, 기울기와 상관없이 <b>같은 비</b>로 잘라 줘요. 그래서 어떤 각도로 올려도 3등분! 등분기에서 이 마법을 직접 부려 봐요.",
          bad: "자석도 우연도 아니에요. 평행선 무리는 사이를 지나는 선분을 <b>줄 간격의 비 그대로</b> 잘라 줘요. 간격이 같으니 어떤 각도로 올려도 똑같이 3등분이 되는 거죠. 등분기에서 각도를 바꿔 가며 확인해 봐요!",
          onDone: finish,
        });
      }, 2650);
    }
  });
};

/* 9 traytrick: 삼각형 쟁반을 한 손가락으로, 균형이 잡히는 단 한 점('무게중심' 명명은 concept 몫) */
export const renderTraytrick: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  // 쟁반(위에서 본 모습) 꼭짓점 (180,34)(74,154)(286,154), 후보점: 왼쪽/가운데(정답)/오른쪽
  const SPOTS: Array<[number, number]> = [[116, 120], [180, 112], [244, 120]];
  const spot = (i: number, x: number, y: number): string =>
    `<g class="tt5-spot" data-i="${i}" transform="translate(${x} ${y})" style="pointer-events: all; cursor: pointer">
      <circle r="16" fill="transparent"/>
      <circle r="9" fill="url(#tt5-dot)" stroke="#96204A" stroke-width="1.6"/>
      <circle r="2.6" fill="#96204A"/>
    </g>`;
  const cup = (x: number, y: number): string =>
    `<g transform="translate(${x} ${y})">
      <circle r="13" fill="#FFF8F0" stroke="#C9B8A8" stroke-width="1.6"/>
      <circle r="9" fill="url(#tt5-coffee)"/>
      <path d="M-4 -2 q4 -4 8 0" stroke="#F4E3C8" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      <ellipse cx="-4" cy="-5" rx="3.5" ry="1.6" fill="#fff" opacity=".5" transform="rotate(-24 -4 -5)"/>
    </g>`;
  fig.innerHTML = wrapSvg(
    `${CARD}
    ${SHADOW(180, 164, 92, 0.12)}
    <g id="tt5-tray" style="transform-box: view-box; transform-origin: 180px 112px; transition: transform .55s ${SPRING}">
      <path d="M180 34 L74 154 L286 154 Z" fill="url(#tt5-tray-g)" stroke="#96204A" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M180 54 L98 146 L262 146 Z" fill="none" stroke="#D4568A" stroke-width="1.6" opacity=".65" stroke-linejoin="round"/>
      <ellipse cx="142" cy="82" rx="24" ry="9" fill="#fff" opacity=".18" transform="rotate(-38 142 82)"/>
      <g id="tt5-cups" style="transition: transform .45s ${EASE}">
        ${cup(180, 78)}${cup(136, 132)}${cup(224, 132)}
      </g>
      ${SPOTS.map(([x, y], i) => spot(i, x, y)).join("")}
    </g>
    <line id="tt5-arm" x1="180" y1="193" x2="180" y2="193" stroke="#243040" stroke-width="3.4" stroke-linecap="round" opacity="0"/>
    <g id="tt5-tip" style="opacity:0; transition: opacity .3s, transform .4s ${EASE}; transform: translate(180px, 186px)">
      <circle r="4.5" fill="#243040"/>
    </g>
    <g id="tt5-pill" style="opacity:0; transition: opacity .3s">
      <rect id="tt5-pillr" x="146" y="14" width="68" height="22" rx="9" fill="#FFF0F5" stroke="#F2B7C6" stroke-width="1.4"/>
      <text id="tt5-pillt" x="180" y="29" text-anchor="middle" font-size="11" font-weight="900" fill="#C2255C">기우뚱!</text>
    </g>`,
    `${BG}
    <linearGradient id="tt5-tray-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E9739C"/><stop offset=".55" stop-color="#D14B84"/><stop offset="1" stop-color="#B23368"/></linearGradient>
    <radialGradient id="tt5-coffee" cx=".38" cy=".32" r="1"><stop offset="0" stop-color="#C89058"/><stop offset="1" stop-color="#8A5A2E"/></radialGradient>
    <radialGradient id="tt5-dot" cx=".38" cy=".32" r="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#F5D6E3"/></radialGradient>`,
  );
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, box);
  helper.innerHTML = "카페 알바 스틱맨이 삼각형 <b>쟁반</b>을 한 손으로 나르려 해요. 어디를 받치면 좋을지 세 지점을 눌러 시험해 봐요.";

  const tray = q<SVGGElement>(fig, "#tt5-tray");
  const cups = q<SVGGElement>(fig, "#tt5-cups");
  const tip = q<SVGGElement>(fig, "#tt5-tip");
  const arm = q<SVGLineElement>(fig, "#tt5-arm");
  const pill = q<SVGGElement>(fig, "#tt5-pill");
  const pillR = q<SVGRectElement>(fig, "#tt5-pillr");
  const pillT = q<SVGTextElement>(fig, "#tt5-pillt");
  const tried = new Set<number>();
  let busy = false;
  let asked = false;
  const showPill = (txt: string, ok: boolean): void => {
    pillT.textContent = txt;
    pillR.setAttribute("fill", ok ? "#F0FBF5" : "#FFF0F5");
    pillR.setAttribute("stroke", ok ? "#7ACB9E" : "#F2B7C6");
    pillT.setAttribute("fill", ok ? "#1E7A31" : "#C2255C");
    pill.style.opacity = "1";
  };
  fig.querySelectorAll<SVGGElement>(".tt5-spot").forEach((sp) => {
    sp.addEventListener("click", () => {
      if (busy || asked) return;
      busy = true;
      const i = Number(sp.dataset.i);
      const [sx, sy] = SPOTS[i];
      haptic(HAPTIC.select);
      tip.style.opacity = "1";
      tip.style.transform = `translate(${sx}px, ${sy}px)`;
      window.setTimeout(() => {
        arm.setAttribute("x1", String(sx));
        arm.setAttribute("y1", String(sy + 7));
        arm.setAttribute("x2", String(sx));
        arm.setAttribute("y2", "187");
        arm.style.opacity = "1";
      }, 420);
      window.setTimeout(() => {
        if (i === 1) {
          showPill("수평!", true);
          haptic(HAPTIC.tap);
          if (tried.size < 2) face("smile");
          if (!tried.has(i) && tried.size < 2) helper.innerHTML = "여기는 수평 그대로예요! 나머지 지점도 눌러 봐요.";
          window.setTimeout(() => { busy = false; }, 450);
        } else {
          // 받침이 가운데를 벗어나면 무게가 쏠린 쪽으로 기운다(왼쪽 받침 = 시계 방향)
          const dir = i === 0 ? 1 : -1;
          tray.style.transform = `rotate(${dir * 8}deg)`;
          cups.style.transform = `translate(${dir * 8}px, 3px)`;
          showPill("기우뚱!", false);
          haptic(HAPTIC.wrong);
          if (tried.size < 2) face("surprised");
          if (!tried.has(i) && tried.size < 2) helper.innerHTML = "기우뚱! 컵이 미끄러질 뻔했어요. 다른 지점도 눌러 봐요.";
          window.setTimeout(() => {
            tray.style.transform = "rotate(0deg)";
            cups.style.transform = "translate(0px, 0px)";
          }, 750);
          window.setTimeout(() => { busy = false; }, 1250);
        }
        tried.add(i);
        if (tried.size === 3 && !asked) {
          asked = true;
          window.setTimeout(() => {
            face("curious");
            helper.innerHTML = "손끝 하나로 버티는 지점, 어떤 특징이 있을까요?";
            ask(box, helper, {
              choices: choices ?? [
                "무게가 사방으로 균형을 이루는 단 한 점이에요",
                "손힘만 세면 어디를 받쳐도 돼요",
                "삼각형에서 가장 뾰족한 꼭짓점 근처예요",
              ],
              good: "맞아요! 쟁반엔 무게가 사방으로 딱 균형을 이루는 점이 <b>단 하나</b> 있어요. 그 점을 벗어나면 기울죠. 그런데 그 점을 눈대중 말고 정확히 찾는 방법이 있을까요? 수색 작전을 시작해요.",
              bad: "힘의 문제도, 뾰족함의 문제도 아니에요. 쟁반에는 무게가 사방으로 균형을 이루는 점이 <b>단 하나</b> 있고, 거기를 벗어나면 어느 쪽으로든 기울어요. 그 한 점을 정확히 찾는 방법을 수색해 봐요!",
              onDone: finish,
            });
          }, 1600);
        }
      }, 480);
    });
  });
};

/* 10 tvsize: 55인치 TV의 정체는 대각선(가로·세로가 정해지면 대각선도 정해진다) */
export const renderTvsize: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  const tape = (id: string, d: string): string =>
    `<path id="${id}" d="${d}" stroke="#F2C14E" stroke-width="8" stroke-linecap="round"
      pathLength="100" stroke-dasharray="100" stroke-dashoffset="100" style="transition: stroke-dashoffset .7s ease-out"/>`;
  fig.innerHTML = wrapSvg(
    `${CARD}
    <path d="M10 164 H350 V176 Q350 192 334 192 H26 Q10 192 10 176 Z" fill="url(#tv5-floor)"/>
    ${SHADOW(180, 170, 96, 0.12)}
    <line x1="124" y1="152" x2="112" y2="168" stroke="#1A222C" stroke-width="5" stroke-linecap="round"/>
    <line x1="236" y1="152" x2="248" y2="168" stroke="#1A222C" stroke-width="5" stroke-linecap="round"/>
    <rect x="80" y="36" width="200" height="116" rx="8" fill="url(#tv5-bezel)" stroke="#0A0E14" stroke-width="2"/>
    <rect x="88" y="44" width="184" height="100" rx="3" fill="url(#tv5-screen)"/>
    <path d="M104 44 L150 44 L118 144 L88 144 Z" fill="#FFFFFF" opacity=".05"/>
    <line x1="84" y1="40" x2="150" y2="40" stroke="#FFFFFF" stroke-width="1.4" opacity=".18"/>
    <circle cx="180" cy="148" r="1.6" fill="#E85D8A"/>
    <path d="M280 38 Q290 44 297 50" stroke="#B8935A" stroke-width="1.4" fill="none"/>
    <g transform="rotate(8 310 60)">
      <rect x="286" y="48" width="52" height="26" rx="7" fill="url(#tv5-tag)" stroke="#C89A2E" stroke-width="1.4"/>
      <text x="312" y="65" text-anchor="middle" font-size="11.5" font-weight="900" fill="#7A5A10">55인치</text>
    </g>
    ${tape("tv5-t1", "M84 26 H276")}
    ${tape("tv5-t2", "M292 44 V144")}
    <path id="tv5-dglow" d="M88 144 L272 44" stroke="#FFD98A" stroke-width="14" stroke-linecap="round" opacity="0" style="transition: opacity .6s"/>
    ${tape("tv5-t3", "M88 144 L272 44")}
    <g id="tv5-l1" style="opacity:0; transition: opacity .4s">
      <rect x="142" y="14" width="76" height="22" rx="8" fill="#FFFFFF" stroke="#EBC7D6" stroke-width="1.4"/>
      <text x="180" y="29" text-anchor="middle" font-size="10.5" font-weight="900" fill="#C2255C">약 48인치</text>
    </g>
    <g id="tv5-l2" style="opacity:0; transition: opacity .4s">
      <rect x="284" y="84" width="64" height="22" rx="8" fill="#FFFFFF" stroke="#EBC7D6" stroke-width="1.4"/>
      <text x="316" y="99" text-anchor="middle" font-size="10.5" font-weight="900" fill="#C2255C">약 27인치</text>
    </g>
    <g id="tv5-l3" style="opacity:0; transform-box: view-box; transform-origin: 180px 94px; transform: scale(.5); transition: opacity .35s, transform .5s ${SPRING}">
      <rect x="134" y="80" width="92" height="28" rx="10" fill="#FFF7E0" stroke="#E8B93E" stroke-width="2"/>
      <text x="180" y="99" text-anchor="middle" font-size="14" font-weight="900" fill="#B4831E">55인치!</text>
    </g>`,
    `${BG}
    <linearGradient id="tv5-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F0DCE6"/><stop offset="1" stop-color="#E5C8D6"/></linearGradient>
    <linearGradient id="tv5-bezel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A4550"/><stop offset=".55" stop-color="#1A222C"/><stop offset="1" stop-color="#0D1218"/></linearGradient>
    <linearGradient id="tv5-screen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#33475F"/><stop offset=".55" stop-color="#1C2A3C"/><stop offset="1" stop-color="#0E1622"/></linearGradient>
    <linearGradient id="tv5-tag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE9A8"/><stop offset="1" stop-color="#F2C14E"/></linearGradient>`,
  );
  const btn = mkBtn("가로 재기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "전자 매장의 <b>55인치 TV</b>예요. 그런데 가로를 재도, 세로를 재도 55가 아니네요. 어디가 55인치일까요? 줄자로 재 봐요.";

  let stage = 0;
  btn.addEventListener("click", () => {
    haptic(HAPTIC.select);
    if (stage === 0) {
      stage = 1;
      q<SVGPathElement>(fig, "#tv5-t1").style.strokeDashoffset = "0";
      window.setTimeout(() => {
        q<SVGGElement>(fig, "#tv5-l1").style.opacity = "1";
        haptic(HAPTIC.tap);
        helper.innerHTML = "가로는 <b>약 48인치</b>, 55가 아니에요! 세로도 재 볼까요?";
      }, 750);
      btn.querySelector("span")!.textContent = "세로 재기";
      return;
    }
    if (stage === 1) {
      stage = 2;
      q<SVGPathElement>(fig, "#tv5-t2").style.strokeDashoffset = "0";
      window.setTimeout(() => {
        q<SVGGElement>(fig, "#tv5-l2").style.opacity = "1";
        haptic(HAPTIC.tap);
        helper.innerHTML = "세로는 <b>약 27인치</b>, 역시 55가 아니네요. 남은 후보는 하나, 대각선이에요!";
      }, 750);
      btn.querySelector("span")!.textContent = "대각선 재기";
      return;
    }
    if (stage === 2) {
      stage = 3;
      btn.disabled = true;
      btn.classList.remove("pulse");
      q<SVGPathElement>(fig, "#tv5-t3").style.strokeDashoffset = "0";
      window.setTimeout(() => {
        q<SVGPathElement>(fig, "#tv5-dglow").style.opacity = ".4";
      }, 550);
      window.setTimeout(() => {
        const l3 = q<SVGGElement>(fig, "#tv5-l3");
        l3.style.opacity = "1";
        l3.style.transform = "scale(1)";
        haptic(HAPTIC.tap);
        face("surprised");
      }, 850);
      window.setTimeout(() => {
        helper.innerHTML = "55인치의 정체는 대각선! 그럼 가로·세로·대각선 사이엔 어떤 관계가 있을까요?";
        ask(box, helper, {
          choices: choices ?? [
            "가로와 세로를 알면 대각선이 딱 정해지는 규칙이 있을 거예요",
            "대각선은 가로 더하기 세로예요",
            "규칙은 없어요, 셋 다 따로따로 재야 해요",
          ],
          good: "좋은 직감이에요! 가로와 세로가 정해지면 대각선은 저절로 정해져요. 그 규칙이 바로 2500년 동안 전해 내려온 보물이죠. 세 정사각형의 넓이에서 그 규칙을 캐 봐요.",
          bad: "더하기라면 48+27=75인치여야 하는데 실제로는 55인치죠. 단순한 더하기는 아니에요. 하지만 가로와 세로가 정해지면 대각선이 저절로 정해지는 <b>확실한 규칙</b>이 있어요. 세 정사각형의 넓이에서 그 규칙을 캐 봐요!",
          onDone: finish,
        });
      }, 1250);
    }
  });
};

/* 11 courtline: 줄자만으로 직각 만들기, 3·4·5를 맞추면 직각이 저절로(직각 판정의 씨앗) */
export const renderCourtline: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  // 말뚝 P0=(96,150), 1m=32px: 3m 변 → A(192,150), 4m 변은 처음 18° 안쪽으로 기움 → 당기면 수직(3·4·5)
  fig.innerHTML = wrapSvg(
    `<rect x="10" y="8" width="340" height="184" rx="16" fill="url(#cl5-ground)"/>
    <ellipse cx="86" cy="42" rx="64" ry="16" fill="#FFFFFF" opacity=".14"/>
    <path d="M24 176 q60 -8 120 -2 M210 182 q50 -8 116 -4" stroke="#C9AE7E" stroke-width="1.6" fill="none" opacity=".5"/>
    ${SHADOW(96, 153, 10, 0.14)}
    ${SHADOW(312, 154, 20, 0.11)}
    <g transform="translate(312 150) scale(-1 1)">${stick(0, 0, 0.92, POSE_POINT)}</g>
    <path id="cl5-l1" d="M96 150 H192" stroke="#FFFFFF" stroke-width="5.5" stroke-linecap="round" opacity=".95"
      pathLength="100" stroke-dasharray="100" stroke-dashoffset="100" style="transition: stroke-dashoffset .6s ease-out"/>
    <g id="cl5-leg" style="transform-box: view-box; transform-origin: 96px 150px; transform: rotate(18deg)">
      <path id="cl5-l2" d="M96 150 L96 22" stroke="#FFFFFF" stroke-width="5.5" stroke-linecap="round" opacity=".95"
        pathLength="100" stroke-dasharray="100" stroke-dashoffset="100" style="transition: stroke-dashoffset .6s ease-out"/>
    </g>
    <rect x="91.5" y="136" width="9" height="16" rx="3" fill="url(#cl5-peg)" stroke="#6E4A22" stroke-width="1.4"/>
    <ellipse cx="96" cy="136" rx="4.5" ry="2.5" fill="#E3BE8C" stroke="#6E4A22" stroke-width="1.1"/>
    <line id="cl5-tape" x1="192" y1="150" x2="135.6" y2="28.3" stroke="#F2C14E" stroke-width="5" stroke-linecap="round" opacity="0" style="transition: opacity .35s"/>
    <circle id="cl5-td" cx="135.6" cy="28.3" r="3.2" fill="#A87A1E" opacity="0" style="transition: opacity .35s"/>
    <circle cx="192" cy="150" r="3.2" fill="#A87A1E" opacity="0" id="cl5-ta" style="transition: opacity .35s"/>
    <circle id="cl5-glow" cx="103" cy="143" r="16" fill="url(#cl5-glowg)" opacity="0" style="transition: opacity .5s"/>
    <path id="cl5-ra" d="M110 150 L110 136 L96 136" stroke="#C2255C" stroke-width="3" fill="none" stroke-linejoin="round" opacity="0" style="transition: opacity .5s"/>
    <g id="cl5-l3lab" style="opacity:0; transition: opacity .4s">
      <rect x="126" y="158" width="36" height="18" rx="7" fill="#FFFFFF" stroke="#EBC7D6" stroke-width="1.3"/>
      <text x="144" y="171" text-anchor="middle" font-size="10.5" font-weight="900" fill="#C2255C">3m</text>
    </g>
    <g id="cl5-l4lab" style="opacity:0; transition: opacity .4s, transform .8s ${EASE}">
      <rect x="118" y="76" width="36" height="18" rx="7" fill="#FFFFFF" stroke="#EBC7D6" stroke-width="1.3"/>
      <text x="136" y="89" text-anchor="middle" font-size="10.5" font-weight="900" fill="#C2255C">4m</text>
    </g>
    <g id="cl5-l5" style="opacity:0; transition: opacity .4s">
      <rect x="120" y="74" width="48" height="22" rx="8" fill="#FFF7E0" stroke="#E8B93E" stroke-width="1.8"/>
      <text x="144" y="89" text-anchor="middle" font-size="12" font-weight="900" fill="#B4831E">5m!</text>
    </g>`,
    `<linearGradient id="cl5-ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4E6C8"/><stop offset=".55" stop-color="#E9D4A8"/><stop offset="1" stop-color="#DABE87"/></linearGradient>
    <linearGradient id="cl5-peg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#C89058"/><stop offset="1" stop-color="#8A5C2E"/></linearGradient>
    <radialGradient id="cl5-glowg" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#F06292" stop-opacity=".4"/><stop offset="1" stop-color="#F06292" stop-opacity="0"/></radialGradient>`,
  );
  const btn = mkBtn("한 변 3m 긋기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "체육대회 코트를 그려요. 각도기는 없고 <b>줄자</b>뿐이에요. 선생님의 비법을 순서대로 따라 해 봐요.";

  let stage = 0;
  btn.addEventListener("click", () => {
    haptic(HAPTIC.select);
    if (stage === 0) {
      stage = 1;
      q<SVGPathElement>(fig, "#cl5-l1").style.strokeDashoffset = "0";
      window.setTimeout(() => {
        q<SVGGElement>(fig, "#cl5-l3lab").style.opacity = "1";
        haptic(HAPTIC.tap);
        helper.innerHTML = "한 변 완성! 길이는 딱 3m예요. 이제 다른 변을 그어요.";
      }, 700);
      btn.querySelector("span")!.textContent = "다른 변 4m 긋기";
      return;
    }
    if (stage === 1) {
      stage = 2;
      q<SVGPathElement>(fig, "#cl5-l2").style.strokeDashoffset = "0";
      window.setTimeout(() => {
        q<SVGGElement>(fig, "#cl5-l4lab").style.opacity = "1";
        haptic(HAPTIC.tap);
        helper.innerHTML = "4m 변을 그었는데, 이 모서리가 <b>직각인지</b> 알 길이 없어요. 이제 마지막 비법, 두 끝을 줄자로 이어 당겨요!";
      }, 700);
      btn.querySelector("span")!.textContent = "빗금 5m로 당기기";
      return;
    }
    if (stage === 2) {
      stage = 3;
      btn.disabled = true;
      btn.classList.remove("pulse");
      const leg = q<SVGGElement>(fig, "#cl5-leg");
      const tp = q<SVGLineElement>(fig, "#cl5-tape");
      const td = q<SVGCircleElement>(fig, "#cl5-td");
      tp.style.opacity = "1";
      td.style.opacity = "1";
      q<SVGCircleElement>(fig, "#cl5-ta").style.opacity = "1";
      q<SVGGElement>(fig, "#cl5-l4lab").style.transform = "translate(-66px, 0px)";
      // 빗금이 5m(160px)가 될 때까지 4m 변을 세운다(3·4·5), setTimeout 스텝 트윈
      const STEPS = 22;
      for (let k = 0; k <= STEPS; k++) {
        window.setTimeout(() => {
          const t = k / STEPS;
          const e = 1 - Math.pow(1 - t, 2);
          const deg = 18 * (1 - e);
          const th = (deg * Math.PI) / 180;
          leg.style.transform = `rotate(${deg}deg)`;
          const bx = 96 + 128 * Math.sin(th);
          const by = 150 - 128 * Math.cos(th);
          tp.setAttribute("x2", String(bx));
          tp.setAttribute("y2", String(by));
          td.setAttribute("cx", String(bx));
          td.setAttribute("cy", String(by));
        }, k * 38);
      }
      window.setTimeout(() => {
        q<SVGPathElement>(fig, "#cl5-ra").style.opacity = "1";
        q<SVGCircleElement>(fig, "#cl5-glow").style.opacity = "1";
        q<SVGGElement>(fig, "#cl5-l5").style.opacity = "1";
        haptic(HAPTIC.tap);
      }, 900);
      window.setTimeout(() => { face("surprised"); }, 1150);
      window.setTimeout(() => {
        helper.innerHTML = "3m, 4m, 그리고 두 끝 사이를 5m로 맞추니 직각이 저절로 생겼어요. 왜일까요?";
        ask(box, helper, {
          choices: choices ?? [
            "세 변이 3, 4, 5인 삼각형은 직각삼각형이 되기 때문이에요",
            "줄자를 팽팽하게 당기면 각이 저절로 90도가 되기 때문이에요",
            "3 더하기 4가 5보다 커서 그래요",
          ],
          good: "정확해요! 3²+4²=9+16=25=5², 지난 시간의 규칙이 딱 맞는 세 변이죠. 이런 세 변으로 삼각형을 만들면 반드시 직각이 생겨요. 거꾸로 방향의 판정법, 판정소에서 확인해 봐요.",
          bad: "팽팽함이나 더하기의 문제가 아니에요. 비밀은 3²+4²=25=5², 지난 시간 규칙이 성립하는 세 변이라는 거예요. 이 관계가 맞는 세 변으로 삼각형을 만들면 <b>반드시</b> 직각이 생겨요. 고대 이집트에서도 쓴 방법이래요. 판정소에서 검증해 봐요!",
          onDone: finish,
        });
      }, 1400);
    }
  });
};
