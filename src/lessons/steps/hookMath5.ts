// hookMath5, Ⅴ 평면도형과 입체도형 훅 장면(구축 중 — 완성되는 장면부터 추가).
// 장면 계약: (scene, helper, finish, face, choices?), 공용 hookAsk.ask()만 사용,
// choices[0]=정답, good≠bad(오개념 교정), 소재명·설정은 도입(helper/narrator)에서 소개.
// 조작 먼저 → 예측 나중(Ⅳ 훅 통일 패턴). 상태 변화는 인라인 스타일 트랜지션 + setTimeout(rAF 금지).
// SVG 파운드리 문법: 3스톱 그라데이션 면 + 좌상단 키라이트 + 접촉 그림자(#2A3A5E) + 재질별 최암색 외곽선.
import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { ask } from "./hookAsk";
import type { AvatarKind } from "../../ui/avatar";

type Face = (k: AvatarKind) => void;
type SceneFn = (scene: HTMLElement, helper: HTMLElement, finish: () => void, face: Face, choices?: string[]) => void;

/* 파운드리 문법 공용 조각 (hookMath4.ts와 동일 문법, 소유 분리 때문에 자체 정의) */
const SHADOW = (cx: number, cy: number, rx: number, o = 0.11): string =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="5" fill="#2A3A5E" opacity="${o}"/>`;

const wrapSvg = (inner: string, defs = "", vb = "0 0 360 200"): string =>
  `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" fill="none"><defs>${defs}</defs>${inner}</svg>`;

const mkBtn = (label: string, pulse = true): HTMLButtonElement =>
  el("button", { class: `swapbtn${pulse ? " pulse" : ""}`, attrs: { type: "button" } }, el("span", { text: label }));

const P = (x: number, y: number): string => `${x.toFixed(1)} ${y.toFixed(1)}`;
const rad = (d: number): number => (d * Math.PI) / 180;
/** 수학 각도(반시계 +) 극좌표 → SVG 픽셀(y 반전). */
const pol = (cx: number, cy: number, r: number, aDeg: number): { x: number; y: number } => ({
  x: cx + r * Math.cos(rad(aDeg)),
  y: cy - r * Math.sin(rad(aDeg)),
});

/* ── 1 fivestar, 별을 그리면 오각형이 나타난다(대각선) ─────────── */
export const renderFivestar: SceneFn = (scene, helper, finish, face, choices) => {
  // 오각형 꼭짓점(중심 180,104 · R 72): A 위 → 반시계. 별은 A→C→E→B→D→A(대각선 순서).
  const C0 = { x: 180, y: 104 };
  const R = 72;
  const vs = [90, 162, 234, 306, 18].map((a) => pol(C0.x, C0.y, R, a)); // A B C D E
  const [A, B, Cc, D, E] = vs;
  const STAR = `M${P(A.x, A.y)} L${P(Cc.x, Cc.y)} L${P(E.x, E.y)} L${P(B.x, B.y)} L${P(D.x, D.y)} Z`;
  const PENTA = `M${P(A.x, A.y)} L${P(B.x, B.y)} L${P(Cc.x, Cc.y)} L${P(D.x, D.y)} L${P(E.x, E.y)} Z`;

  const fig = el("div", {});
  fig.innerHTML = wrapSvg(
    `${SHADOW(180, 192, 92, 0.1)}
    <rect x="52" y="8" width="256" height="180" rx="10" fill="url(#fs-pp)" stroke="#C9D2DC" stroke-width="1.6"/>
    <rect x="52" y="8" width="256" height="16" rx="10" fill="#FFFFFF" opacity=".55"/>
    <line x1="66" y1="42" x2="294" y2="42" stroke="#E3EAF2" stroke-width="1.2"/>
    <line x1="66" y1="174" x2="294" y2="174" stroke="#E3EAF2" stroke-width="1.2"/>
    <path class="fs-star" d="${STAR}" stroke="url(#fs-ink)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"
      pathLength="100" stroke-dasharray="100" stroke-dashoffset="100" style="transition: stroke-dashoffset 1.8s ease-out"/>
    <g class="fs-tips" style="opacity:0; transition: opacity .5s">
      ${vs.map((v) => `<circle cx="${v.x.toFixed(1)}" cy="${v.y.toFixed(1)}" r="5" fill="#2F9E44" stroke="#1E7A31" stroke-width="1.4"/>`).join("")}
    </g>
    <path class="fs-penta" d="${PENTA}" stroke="#2F9E44" stroke-width="2.6" stroke-linejoin="round" stroke-dasharray="7 6"
      pathLength="100" style="opacity:0; transition: opacity .6s"/>
    <g transform="rotate(-38 268 158)">
      <rect x="258" y="118" width="13" height="64" rx="3" fill="url(#fs-pc)" stroke="#B98A00" stroke-width="1.2"/>
      <path d="M258 182 L264.5 196 L271 182 Z" fill="#F2D9B0" stroke="#B98A00" stroke-width="1.2"/>
      <path d="M262.5 191.5 L264.5 196 L266.5 191.5 Z" fill="#3A4A5C"/>
      <ellipse cx="261.5" cy="128" rx="1.8" ry="8" fill="#fff" opacity=".5"/>
    </g>`,
    `<linearGradient id="fs-pp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".55" stop-color="#F7FAFD"/><stop offset="1" stop-color="#EDF2F8"/></linearGradient>
    <linearGradient id="fs-ink" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4A5A6E"/><stop offset=".55" stop-color="#38485C"/><stop offset="1" stop-color="#2A3848"/></linearGradient>
    <linearGradient id="fs-pc" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFD98A"/><stop offset=".55" stop-color="#F2B430"/><stop offset="1" stop-color="#D89A1E"/></linearGradient>`,
  );
  const btn1 = mkBtn("한붓에 별 긋기");
  const btn2 = mkBtn("꼭짓점 이어 보기");
  btn2.style.display = "none";
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn1, btn2, box);
  helper.innerHTML = "노트 귀퉁이에 다들 한 번쯤 그려 본 <b>별</b>이에요. 연필을 떼지 않고 다섯 획이면 완성이죠. 먼저 별부터 그려 볼까요?";

  btn1.addEventListener("click", () => {
    btn1.disabled = true;
    btn1.classList.remove("pulse");
    haptic(HAPTIC.select);
    (fig.querySelector(".fs-star") as SVGPathElement).style.strokeDashoffset = "0";
    window.setTimeout(() => {
      face("curious");
      helper.innerHTML = "완성! 그런데 별의 <b>뾰족한 끝이 다섯 개</b>네요. 이 끝점들을 차례로 이으면 무슨 일이 생길까요?";
      btn1.style.display = "none";
      btn2.style.display = "";
    }, 1950);
  });

  btn2.addEventListener("click", () => {
    btn2.disabled = true;
    btn2.classList.remove("pulse");
    haptic(HAPTIC.select);
    (fig.querySelector(".fs-tips") as SVGGElement).style.opacity = "1";
    window.setTimeout(() => {
      (fig.querySelector(".fs-penta") as SVGPathElement).style.opacity = "1";
    }, 500);
    window.setTimeout(() => {
      face("surprised");
      helper.innerHTML = "<b>오각형</b>이 나타났어요! 오각형은 한 번도 안 그렸는데요. 그럼 아까 그은 별의 다섯 획, 정체가 뭘까요?";
      window.setTimeout(() => {
        ask(box, helper, {
          choices: choices ?? [
            "오각형에서 이웃하지 않는 꼭짓점끼리 이은 선이에요",
            "오각형의 변 다섯 개를 이은 거예요",
            "우연히 오각형처럼 보일 뿐, 아무 관계 없어요",
          ],
          good: "정확해요! 별의 획은 전부 꼭짓점을 <b>하나 건너뛰어</b> 이은 선, 이런 선에는 정식 이름이 있어요. 랩에서 직접 그어 보며 개수의 규칙까지 찾아봐요!",
          bad: "변은 <b>이웃한</b> 꼭짓점을 잇는 초록 점선 쪽이에요. 별의 획은 꼭짓점을 하나 <b>건너뛰어</b> 이었죠. 이렇게 이웃하지 않는 꼭짓점을 이은 선의 이름을 랩에서 알아봐요!",
          onDone: finish,
        });
      }, 900);
    }, 1100);
  });
};

/* ── 2 aladder, A자 사다리 벌리기(삼각형 내각의 합) ─────────────── */
export const renderAladder: SceneFn = (scene, helper, finish, face, choices) => {
  const APEX = { x: 180, y: 40 };
  const GY = 168; // 지면
  const H = GY - APEX.y;
  /** 꼭대기 각 top(°)일 때 사다리 다리·각 호 SVG. */
  const frame = (top: number): string => {
    const half = H * Math.tan(rad(top / 2));
    const lf = { x: APEX.x - half, y: GY };
    const rf = { x: APEX.x + half, y: GY };
    const base = (180 - top) / 2;
    // 가로대(발판) 3개
    let rungs = "";
    for (let i = 1; i <= 3; i++) {
      const t = 0.3 + i * 0.17;
      const y = APEX.y + H * t;
      const w = half * t;
      rungs += `<line x1="${(APEX.x - w).toFixed(1)}" y1="${y.toFixed(1)}" x2="${(APEX.x + w).toFixed(1)}" y2="${y.toFixed(1)}" stroke="#B0662A" stroke-width="4.6" stroke-linecap="round"/>`;
    }
    // 각 호: 꼭대기(로즈), 두 밑각(앰버·시안)
    const aL = Math.atan2(H, half) * (180 / Math.PI); // 왼발에서 오른위로 향하는 다리의 기울기
    return (
      `${SHADOW(APEX.x, GY + 10, half + 22, 0.13)}
      ${rungs}
      <line x1="${APEX.x}" y1="${APEX.y}" x2="${lf.x.toFixed(1)}" y2="${lf.y}" stroke="url(#al-lg)" stroke-width="7" stroke-linecap="round"/>
      <line x1="${APEX.x}" y1="${APEX.y}" x2="${rf.x.toFixed(1)}" y2="${rf.y}" stroke="url(#al-lg2)" stroke-width="7" stroke-linecap="round"/>
      <circle cx="${APEX.x}" cy="${APEX.y}" r="6.5" fill="url(#al-hd)" stroke="#8C5A12" stroke-width="1.4"/>
      <path d="M ${P(pol(APEX.x, APEX.y, 26, -90 - top / 2).x, pol(APEX.x, APEX.y, 26, -90 - top / 2).y)} A26 26 0 0 0 ${P(pol(APEX.x, APEX.y, 26, -90 + top / 2).x, pol(APEX.x, APEX.y, 26, -90 + top / 2).y)}" stroke="#E8547E" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <text x="${APEX.x}" y="${APEX.y + 44}" text-anchor="middle" font-size="13" font-weight="800" fill="#E8547E">${top}°</text>
      <path d="M ${P(lf.x + 24, GY)} A24 24 0 0 0 ${P(pol(lf.x, lf.y, 24, aL).x, pol(lf.x, lf.y, 24, aL).y)}" stroke="#F08C00" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <text x="${(lf.x + 34).toFixed(1)}" y="${GY - 14}" text-anchor="middle" font-size="12.5" font-weight="800" fill="#F08C00">${base}°</text>
      <path d="M ${P(rf.x - 24, GY)} A24 24 0 0 1 ${P(pol(rf.x, rf.y, 24, 180 - aL).x, pol(rf.x, rf.y, 24, 180 - aL).y)}" stroke="#0DA5C6" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <text x="${(rf.x - 34).toFixed(1)}" y="${GY - 14}" text-anchor="middle" font-size="12.5" font-weight="800" fill="#0DA5C6">${base}°</text>`
    );
  };
  const fig = el("div", {});
  const draw = (top: number): void => {
    fig.innerHTML = wrapSvg(
      `<rect x="20" y="6" width="320" height="162" rx="14" fill="url(#al-wl)"/>
      <rect x="20" y="160" width="320" height="34" rx="8" fill="url(#al-fl)" stroke="#C9B79B" stroke-width="1.2"/>
      <g class="al-frame" style="transition: opacity .3s">${frame(top)}</g>`,
      `<linearGradient id="al-wl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4F8FC"/><stop offset="1" stop-color="#E6EDF4"/></linearGradient>
      <linearGradient id="al-fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EAD9BC"/><stop offset=".5" stop-color="#DFC9A4"/><stop offset="1" stop-color="#CDB488"/></linearGradient>
      <linearGradient id="al-lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFD98A"/><stop offset=".55" stop-color="#E8A83E"/><stop offset="1" stop-color="#C9861E"/></linearGradient>
      <linearGradient id="al-lg2" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2C468"/><stop offset=".55" stop-color="#D8952E"/><stop offset="1" stop-color="#B87816"/></linearGradient>
      <radialGradient id="al-hd" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#FFE9B0"/><stop offset="1" stop-color="#E8A83E"/></radialGradient>`,
    );
  };
  draw(40);
  const btn = mkBtn("사다리 더 벌리기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "전구를 갈 때 쓰는 <b>A자 사다리</b>예요. 옆에서 보면 삼각형이죠. 지금 세 각은 <b>40°, 70°, 70°</b>예요. 다리를 더 벌리면 어떻게 될까요?";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    const g = fig.querySelector(".al-frame") as SVGGElement;
    g.style.opacity = "0";
    window.setTimeout(() => {
      draw(60);
      face("surprised");
      helper.innerHTML = "꼭대기가 40°에서 <b>60°</b>로 커지니, 바닥의 두 각은 70°에서 <b>60°</b>로 작아졌어요! 커진 만큼 정확히 나눠 줄어든 거죠. 세 각을 합치면 어떨까요?";
      window.setTimeout(() => {
        ask(box, helper, {
          choices: choices ?? [
            "벌리든 오므리든 세 각의 합은 늘 그대로예요",
            "많이 벌릴수록 세 각의 합도 커져요",
            "사다리 크기에 따라 합이 달라져요",
          ],
          good: "맞아요! 40+70+70도, 60+60+60도 똑같이 <b>180</b>이에요. 세상 모든 삼각형이 나눠 갖는 비밀의 합! 왜 하필 180인지 랩에서 세 각을 직접 뜯어 모아 확인해요.",
          bad: "직접 더해 봐요. 40+70+70=180, 60+60+60=180! 한 각이 커지면 다른 각이 그만큼 작아져서 합은 <b>절대 변하지 않아요</b>. 왜 하필 180인지 랩에서 확인해요!",
          onDone: finish,
        });
      }, 1200);
    }, 320);
  });
};

/* ── 3 honeycomb, 벌집이 육각형인 이유(내각의 크기) ─────────────── */
export const renderHoneycomb: SceneFn = (scene, helper, finish, face, choices) => {
  /** 꼭짓점 Pt에서 시작각 aDeg로 출발하는 정n각형(변 s) 경로. 한 내각이 Pt에 놓인다. */
  const polyAt = (px: number, py: number, aDeg: number, s: number, n: number): string => {
    const ext = 360 / n;
    let x = px;
    let y = py;
    let h = aDeg;
    let d = `M${P(x, y)}`;
    for (let i = 0; i < n - 1; i++) {
      x += s * Math.cos(rad(h));
      y -= s * Math.sin(rad(h));
      d += ` L${P(x, y)}`;
      h += ext;
    }
    return d + " Z";
  };
  const CX = 186;
  const CY = 118;
  const fig = el("div", {});
  fig.innerHTML = wrapSvg(
    `<rect x="14" y="6" width="332" height="188" rx="16" fill="url(#hc-sk)"/>
    ${[0, 1, 2].map((i) => `<path d="${polyAt(316, 30 + i * 30, 210, 17, 6)}" fill="url(#hc-cell)" stroke="#C9861E" stroke-width="1.3" opacity=".8"/>`).join("")}
    ${SHADOW(CX, 186, 84, 0.12)}
    <g class="hc-try"></g>
    <circle cx="${CX}" cy="${CY}" r="4" fill="#3A2A10"/>
    <g transform="translate(72 44)">
      <ellipse cx="0" cy="0" rx="13" ry="9" fill="url(#hc-bee)" stroke="#3A2A10" stroke-width="1.4"/>
      <path d="M-4 -9 Q-2 -1 -4 8 M3 -9 Q5 -1 3 8" stroke="#3A2A10" stroke-width="2.2"/>
      <ellipse cx="-3" cy="-11" rx="7" ry="4.5" fill="#EAF4FB" stroke="#9FB8C8" stroke-width="1" opacity=".9"/>
      <ellipse cx="7" cy="-10" rx="6" ry="4" fill="#EAF4FB" stroke="#9FB8C8" stroke-width="1" opacity=".9"/>
      <circle cx="12" cy="2" r="1.4" fill="#3A2A10"/>
    </g>`,
    `<linearGradient id="hc-sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FDF6E8"/><stop offset=".55" stop-color="#FAEED4"/><stop offset="1" stop-color="#F4E2BC"/></linearGradient>
    <linearGradient id="hc-cell" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFD98A"/><stop offset=".55" stop-color="#F2B430"/><stop offset="1" stop-color="#D89A1E"/></linearGradient>
    <linearGradient id="hc-p" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFE3B0"/><stop offset=".55" stop-color="#F2C468"/><stop offset="1" stop-color="#E0A83E"/></linearGradient>`,
  );
  const btn1 = mkBtn("정오각형으로 지어 보기");
  const btn2 = mkBtn("정육각형으로 지어 보기");
  btn2.style.display = "none";
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn1, btn2, box);
  helper.innerHTML = "벌집을 자세히 보면 방이 전부 <b>정육각형</b>이에요. 벌은 왜 하필 육각형으로 지을까요? 다른 도형, 예를 들어 <b>정오각형</b>으로 지으면 어떻게 되는지 한 점에 모아 붙여 봐요.";

  const gTry = (): SVGGElement => fig.querySelector(".hc-try") as SVGGElement;

  btn1.addEventListener("click", () => {
    btn1.disabled = true;
    btn1.classList.remove("pulse");
    haptic(HAPTIC.select);
    const g = gTry();
    // 정오각형 3개: 꼭짓점 CX,CY에 내각 108°씩, 시작각 0·108·216 — 324°를 덮고 36° 틈.
    [0, 108, 216].forEach((a, i) => {
      window.setTimeout(() => {
        g.insertAdjacentHTML(
          "beforeend",
          `<path d="${polyAt(CX, CY, a, 52, 5)}" fill="url(#hc-p)" fill-opacity=".85" stroke="#B0662A" stroke-width="1.8" stroke-linejoin="round" style="opacity:0; transition: opacity .4s"/>`,
        );
        window.setTimeout(() => ((g.lastElementChild as SVGPathElement).style.opacity = "1"), 30);
        haptic(HAPTIC.tap);
      }, i * 550);
    });
    window.setTimeout(() => {
      // 틈 쐐기(324°~360°) 강조
      const p1 = pol(CX, CY, 58, 324);
      const p2 = pol(CX, CY, 58, 360);
      const m = pol(CX, CY, 74, 342);
      gTry().insertAdjacentHTML(
        "beforeend",
        `<g style="opacity:0; transition: opacity .5s" class="hc-gap">
          <path d="M${P(CX, CY)} L${P(p1.x, p1.y)} A58 58 0 0 0 ${P(p2.x, p2.y)} Z" fill="#F04452" opacity=".2"/>
          <path d="M${P(CX, CY)} L${P(p1.x, p1.y)} M${P(CX, CY)} L${P(p2.x, p2.y)}" stroke="#F04452" stroke-width="2" stroke-dasharray="4 4"/>
          <text x="${m.x.toFixed(1)}" y="${m.y.toFixed(1)}" text-anchor="middle" font-size="12.5" font-weight="800" fill="#F04452">36° 틈!</text>
        </g>`,
      );
      window.setTimeout(() => ((gTry().querySelector(".hc-gap") as SVGGElement).style.opacity = "1"), 30);
      face("curious");
      helper.innerHTML = "정오각형의 한 각은 <b>108°</b>, 세 개를 모아도 108°×3=<b>324°</b>라 36°가 비어요. 틈이 있으면 꿀이 새죠! 그럼 정육각형은요?";
      btn1.style.display = "none";
      btn2.style.display = "";
    }, 2000);
  });

  btn2.addEventListener("click", () => {
    btn2.disabled = true;
    btn2.classList.remove("pulse");
    haptic(HAPTIC.select);
    const g = gTry();
    g.innerHTML = "";
    [0, 120, 240].forEach((a, i) => {
      window.setTimeout(() => {
        g.insertAdjacentHTML(
          "beforeend",
          `<path d="${polyAt(CX, CY, a, 48, 6)}" fill="url(#hc-cell)" fill-opacity=".88" stroke="#B0662A" stroke-width="1.8" stroke-linejoin="round" style="opacity:0; transition: opacity .4s"/>`,
        );
        window.setTimeout(() => ((g.lastElementChild as SVGPathElement).style.opacity = "1"), 30);
        haptic(HAPTIC.tap);
      }, i * 550);
    });
    window.setTimeout(() => {
      face("surprised");
      helper.innerHTML = "<b>빈틈 하나 없이 딱!</b> 이번엔 완벽하게 맞물렸어요. 정육각형 세 개가 한 점에서 딱 맞는 비결이 뭘까요?";
      window.setTimeout(() => {
        ask(box, helper, {
          choices: choices ?? [
            "한 각이 120°라서 세 개를 모으면 딱 360°가 되거든요",
            "벌이 밀랍을 눌러 늘리면서 틈을 메운 거예요",
            "육각형이 원과 가장 비슷한 모양이라서요",
          ],
          good: "정확해요! 한 바퀴는 360°, 정육각형의 한 각은 120°니까 <b>120°×3=360°</b>로 빈틈 제로! 그럼 각 도형의 \"한 각의 크기\"는 어떻게 알아낼까요? 열쇠는 내각의 합, 랩에서 찾아봐요.",
          bad: "비결은 벌의 손재주도 모양의 닮음도 아니라 <b>각도 계산</b>이에요. 한 바퀴 360°를 정육각형의 한 각 120°가 정확히 3등분하죠(120°×3=360°). 그 \"한 각의 크기\"를 구하는 법을 랩에서 찾아봐요!",
          onDone: finish,
        });
      }, 1100);
    }, 2000);
  });
};

/* ── 5 watermelon, 수박 두 가지 컷(부채꼴·활꼴) ─────────────────── */
export const renderWatermelon: SceneFn = (scene, helper, finish, face, choices) => {
  const CXc = 150;
  const CYc = 104;
  const RW = 74;
  /** 수박 조각(단면): kind sector = 중심각 52° 웨지, segment = 현으로 자른 반달. */
  const slice = (kind: "sector" | "segment"): string => {
    if (kind === "sector") {
      const p0 = pol(CXc, CYc, RW, 240);
      const p1 = pol(CXc, CYc, RW, 292);
      return (
        `<g class="wm-sec" style="opacity:0; transition: opacity .5s, transform .7s cubic-bezier(.34,1.2,.5,1)">` +
        `<path d="M${P(CXc, CYc)} L${P(p0.x, p0.y)} A${RW} ${RW} 0 0 0 ${P(p1.x, p1.y)} Z" fill="url(#wm-fl)" stroke="#B23A48" stroke-width="1.6"/>` +
        `<path d="M${P(p0.x, p0.y)} A${RW} ${RW} 0 0 0 ${P(p1.x, p1.y)}" stroke="url(#wm-rd)" stroke-width="7" fill="none"/>` +
        `<circle cx="${(CXc + p0.x + p1.x) / 3}" cy="${(CYc + p0.y + p1.y) / 3}" r="2.2" fill="#2A3040"/>` +
        `<circle cx="${(CXc + p0.x + p1.x) / 3 + 10}" cy="${(CYc + p0.y + p1.y) / 3 - 8}" r="2" fill="#2A3040"/>` +
        `</g>`
      );
    }
    const c0 = pol(CXc, CYc, RW, 128);
    const c1 = pol(CXc, CYc, RW, 52);
    return (
      `<g class="wm-seg" style="opacity:0; transition: opacity .5s, transform .7s cubic-bezier(.34,1.2,.5,1)">` +
      `<path d="M${P(c0.x, c0.y)} A${RW} ${RW} 0 0 1 ${P(c1.x, c1.y)} Z" fill="url(#wm-fl)" stroke="#B23A48" stroke-width="1.6"/>` +
      `<path d="M${P(c0.x, c0.y)} A${RW} ${RW} 0 0 1 ${P(c1.x, c1.y)}" stroke="url(#wm-rd)" stroke-width="7" fill="none"/>` +
      `<circle cx="${CXc}" cy="${CYc - RW * 0.55}" r="2.2" fill="#2A3040"/>` +
      `<circle cx="${CXc - 16}" cy="${CYc - RW * 0.42}" r="2" fill="#2A3040"/>` +
      `<circle cx="${CXc + 15}" cy="${CYc - RW * 0.45}" r="2" fill="#2A3040"/>` +
      `</g>`
    );
  };
  const fig = el("div", {});
  fig.innerHTML = wrapSvg(
    `${SHADOW(150, 190, 82, 0.13)}
    <circle cx="${CXc}" cy="${CYc}" r="${RW + 7}" fill="url(#wm-sk)" stroke="#1E5B2F" stroke-width="2"/>
    <path d="M${CXc - 70} ${CYc - 28} q30 -22 66 -14 M${CXc - 52} ${CYc + 42} q26 18 62 6" stroke="#174D26" stroke-width="7" fill="none" opacity=".5" stroke-linecap="round"/>
    <circle cx="${CXc}" cy="${CYc}" r="${RW}" fill="url(#wm-fl2)"/>
    <ellipse cx="${CXc - 26}" cy="${CYc - 34}" rx="18" ry="9" fill="#fff" opacity=".25"/>
    ${slice("sector")}${slice("segment")}
    <g transform="translate(300 66) rotate(24)">
      <rect x="-5" y="-44" width="10" height="72" rx="4" fill="url(#wm-kn)" stroke="#7C8998" stroke-width="1.2"/>
      <rect x="-6" y="28" width="12" height="30" rx="5" fill="url(#wm-hd)" stroke="#4A3418" stroke-width="1.2"/>
    </g>`,
    `<radialGradient id="wm-sk" cx=".36" cy=".3" r="1"><stop offset="0" stop-color="#4CAF62"/><stop offset=".6" stop-color="#2E8B45"/><stop offset="1" stop-color="#1E6B32"/></radialGradient>
    <radialGradient id="wm-fl2" cx=".4" cy=".35" r="1"><stop offset="0" stop-color="#FF8B94"/><stop offset=".6" stop-color="#F25864"/><stop offset="1" stop-color="#D93A4C"/></radialGradient>
    <linearGradient id="wm-fl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF9AA2"/><stop offset=".55" stop-color="#F25864"/><stop offset="1" stop-color="#D93A4C"/></linearGradient>
    <linearGradient id="wm-rd" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7BC98A"/><stop offset=".5" stop-color="#3E9A54"/><stop offset="1" stop-color="#2E7B41"/></linearGradient>
    <linearGradient id="wm-kn" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E8EEF4"/><stop offset=".5" stop-color="#C2CCD8"/><stop offset="1" stop-color="#9AA8B8"/></linearGradient>
    <linearGradient id="wm-hd" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8A6432"/><stop offset="1" stop-color="#5F4420"/></linearGradient>`,
  );
  const btn1 = mkBtn("웨지로 자르기");
  const btn2 = mkBtn("반달로 자르기");
  btn2.style.display = "none";
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn1, btn2, box);
  helper.innerHTML = "여름 하면 <b>수박</b>! 자르는 방법은 두 파로 나뉘죠. 뾰족한 <b>웨지파</b>와 둥근 <b>반달파</b>. 먼저 웨지로 잘라 볼까요?";

  btn1.addEventListener("click", () => {
    btn1.disabled = true;
    btn1.classList.remove("pulse");
    haptic(HAPTIC.select);
    const g = fig.querySelector(".wm-sec") as SVGGElement;
    g.style.opacity = "1";
    window.setTimeout(() => (g.style.transform = "translate(-14px, 26px)"), 80);
    window.setTimeout(() => {
      helper.innerHTML = "웨지 조각은 <b>수박의 한가운데</b>까지 곧은 선 두 개로 잘랐어요. 이번엔 반달!";
      btn1.style.display = "none";
      btn2.style.display = "";
    }, 1100);
  });
  btn2.addEventListener("click", () => {
    btn2.disabled = true;
    btn2.classList.remove("pulse");
    haptic(HAPTIC.select);
    const g = fig.querySelector(".wm-seg") as SVGGElement;
    g.style.opacity = "1";
    window.setTimeout(() => (g.style.transform = "translate(10px, -30px)"), 80);
    window.setTimeout(() => {
      face("curious");
      helper.innerHTML = "반달 조각은 중심을 <b>지나지 않는</b> 곧은 선 한 번에 싹둑! 두 조각의 결정적 차이는 뭘까요?";
      window.setTimeout(() => {
        ask(box, helper, {
          choices: choices ?? [
            "웨지는 중심까지 닿는 선 2개, 반달은 중심을 안 지나는 선 1개로 잘랐어요",
            "웨지가 반달보다 항상 커요",
            "반달은 곡선으로만 잘라서 곧은 선이 없어요",
          ],
          good: "정확해요! 중심을 지나느냐가 갈림길이에요. 두 조각 모양엔 각각 정식 수학 이름이 있답니다. 원의 부품 상점으로 들어가 봐요!",
          bad: "크기는 자르기 나름이고, 반달에도 <b>곧은 선</b>(둥근 껍질의 양 끝을 잇는 직선)이 하나 있어요. 진짜 차이는 <b>중심을 지나느냐</b>! 두 모양의 정식 이름을 랩에서 만나요.",
          onDone: finish,
        });
      }, 900);
    }, 1100);
  });
};

/* ── 6 cakecut, 각도 2배 케이크(부채꼴의 성질) ──────────────────── */
export const renderCakecut: SceneFn = (scene, helper, finish, face, choices) => {
  const CXk = 170;
  const CYk = 110;
  const RK = 78;
  const wedge = (a0: number, a1: number, cls: string): string => {
    const p0 = pol(CXk, CYk, RK, a0);
    const p1 = pol(CXk, CYk, RK, a1);
    const large = a1 - a0 > 180 ? 1 : 0;
    return (
      `<g class="${cls}" style="opacity:0; transition: opacity .5s">` +
      `<path d="M${P(CXk, CYk)} L${P(p0.x, p0.y)} A${RK} ${RK} 0 ${large} 0 ${P(p1.x, p1.y)} Z" fill="url(#ck-cm)" stroke="#B0662A" stroke-width="1.6"/>` +
      `<path d="M${P(p0.x, p0.y)} A${RK} ${RK} 0 ${large} 0 ${P(p1.x, p1.y)}" stroke="url(#ck-ch)" stroke-width="8" fill="none"/>` +
      `</g>`
    );
  };
  const fig = el("div", {});
  fig.innerHTML = wrapSvg(
    `${SHADOW(CXk, 196, 96, 0.13)}
    <circle cx="${CXk}" cy="${CYk}" r="${RK + 9}" fill="url(#ck-pl)" stroke="#C9D2DC" stroke-width="1.6"/>
    <circle cx="${CXk}" cy="${CYk}" r="${RK}" fill="url(#ck-tp)" stroke="#C98A3E" stroke-width="1.6"/>
    ${Array.from({ length: 12 }, (_, i) => {
      const p = pol(CXk, CYk, RK - 13, i * 30 + 15);
      return `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.4" fill="#E85D75"/>`;
    }).join("")}
    <ellipse cx="${CXk - 26}" cy="${CYk - 30}" rx="20" ry="10" fill="#fff" opacity=".35"/>
    ${wedge(75, 105, "ck-a")}${wedge(180, 240, "ck-b")}`,
    `<linearGradient id="ck-pl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#DCE4EC"/></linearGradient>
    <radialGradient id="ck-tp" cx=".4" cy=".35" r="1"><stop offset="0" stop-color="#FFE9C4"/><stop offset=".6" stop-color="#F7CE8E"/><stop offset="1" stop-color="#E8B468"/></radialGradient>
    <linearGradient id="ck-cm" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF2D8"/><stop offset=".55" stop-color="#F7CE8E"/><stop offset="1" stop-color="#E8B468"/></linearGradient>
    <linearGradient id="ck-ch" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8A5A2E"/><stop offset=".5" stop-color="#6B4420"/><stop offset="1" stop-color="#523216"/></linearGradient>`,
  );
  const btn1 = mkBtn("30° 조각 자르기");
  const btn2 = mkBtn("옆 사람은 60° 조각!");
  btn2.style.display = "none";
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn1, btn2, box);
  helper.innerHTML = "생일 케이크 분배 시간! 나는 <b>30°</b> 조각을 받았어요. 그런데 옆 사람이 <b>60°</b> 조각을 받네요?";

  btn1.addEventListener("click", () => {
    btn1.disabled = true;
    btn1.classList.remove("pulse");
    haptic(HAPTIC.select);
    (fig.querySelector(".ck-a") as SVGGElement).style.opacity = "1";
    window.setTimeout(() => {
      btn1.style.display = "none";
      btn2.style.display = "";
    }, 800);
  });
  btn2.addEventListener("click", () => {
    btn2.disabled = true;
    btn2.classList.remove("pulse");
    haptic(HAPTIC.select);
    (fig.querySelector(".ck-b") as SVGGElement).style.opacity = "1";
    window.setTimeout(() => {
      face("curious");
      helper.innerHTML = "각도가 2배니까 배도 2배로 아플 것 같은데요. 정말 <b>빵의 양</b>도, 겉의 <b>초코 테두리 길이</b>도 정확히 2배일까요?";
      window.setTimeout(() => {
        ask(box, helper, {
          choices: choices ?? [
            "네, 빵의 양도 테두리 길이도 정확히 2배예요",
            "빵은 2배지만 테두리는 2배보다 길어요",
            "눈에만 2배로 보이고 실제론 2배가 안 돼요",
          ],
          good: "정확해요! 각도가 2배면 넓이도 호(테두리)도 <b>정확히 2배</b>, 이걸 정비례라고 했죠(Ⅲ단원!). 그런데 딱 하나, 2배가 안 되는 길이가 숨어 있어요. 랩에서 함정을 찾아봐요!",
          bad: "저울과 자로 재 보면 <b>정확히 2배</b>예요! 각도를 2배로 벌리면 빵(넓이)도 테두리(호)도 2배, 바로 정비례죠. 그런데 딱 하나 2배가 안 되는 길이가 있어요. 랩에서 그 함정을 찾아봐요!",
          onDone: finish,
        });
      }, 900);
    }, 800);
  });
};

/* ── 7 lanestart, 트랙 출발선의 비밀(호의 길이) ─────────────────── */
export const renderLanestart: SceneFn = (scene, helper, finish, face, choices) => {
  // 위에서 본 트랙: 직선 2 + 반원 2(왼쪽·오른쪽), 레인 2개
  const fig = el("div", {});
  const trackPath = (r: number): string =>
    `M ${110} ${140 - r} L ${250} ${140 - r} A ${r} ${r} 0 0 1 ${250} ${140 + r} L ${110} ${140 + r} A ${r} ${r} 0 0 1 ${110} ${140 - r}`;
  fig.innerHTML = wrapSvg(
    `<rect x="16" y="52" width="328" height="140" rx="24" fill="url(#ln-gs)"/>
    <path d="${trackPath(62)}" stroke="url(#ln-tk)" stroke-width="40" fill="none"/>
    <path d="${trackPath(62)}" stroke="#FFFFFF" stroke-width="1.6" fill="none" stroke-dasharray="6 7" opacity=".85"/>
    <path class="ln-in" d="M 250 ${140 - 52} A 52 52 0 0 1 250 ${140 + 52}" stroke="#2F9E44" stroke-width="6" fill="none" style="opacity:0; transition: opacity .5s" stroke-linecap="round"/>
    <path class="ln-out" d="M 250 ${140 - 72} A 72 72 0 0 1 250 ${140 + 72}" stroke="#E8547E" stroke-width="6" fill="none" style="opacity:0; transition: opacity .5s" stroke-linecap="round"/>
    <line x1="236" y1="${140 - 82}" x2="236" y2="${140 - 62}" stroke="#FFFFFF" stroke-width="3"/>
    <line x1="252" y1="${140 - 62}" x2="252" y2="${140 - 42}" stroke="#FFFFFF" stroke-width="3"/>
    <g class="ln-lbl" style="opacity:0; transition: opacity .5s">
      <text x="296" y="196" font-size="11.5" font-weight="800" fill="#E8547E">바깥 곡선</text>
      <text x="256" y="118" font-size="11.5" font-weight="800" fill="#1E7A31">안쪽 곡선</text>
    </g>
    ${SHADOW(244, 52, 16, 0.18)}
    <g transform="translate(252 44) scale(.72)"><circle cx="0" cy="-26" r="7.2" fill="#243040"/><path d="M0 -19 V2 M0 -13 L-11 -20 M0 -13 L12 -6 M0 2 L-12 10 M0 2 L11 14" stroke="#243040" stroke-width="3.4" stroke-linecap="round" fill="none"/></g>
    ${SHADOW(236, 76, 16, 0.18)}
    <g transform="translate(228 68) scale(.72)"><circle cx="0" cy="-26" r="7.2" fill="#3E5A78"/><path d="M0 -19 V2 M0 -13 L-11 -20 M0 -13 L12 -6 M0 2 L-12 10 M0 2 L11 14" stroke="#3E5A78" stroke-width="3.4" stroke-linecap="round" fill="none"/></g>`,
    `<linearGradient id="ln-gs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8FD49C"/><stop offset=".55" stop-color="#5CB86E"/><stop offset="1" stop-color="#3E9A52"/></linearGradient>
    <linearGradient id="ln-tk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E8836E"/><stop offset=".55" stop-color="#D9603F"/><stop offset="1" stop-color="#B84A2E"/></linearGradient>`,
  );
  const btn = mkBtn("곡선 구간 비교하기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "육상 400m 경기의 출발 장면, 뭔가 이상해요. 바깥 레인 선수가 <b>더 앞에서</b> 출발하고 있어요! 반칙 아닐까요?";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    (fig.querySelector(".ln-in") as SVGPathElement).style.opacity = "1";
    window.setTimeout(() => {
      (fig.querySelector(".ln-out") as SVGPathElement).style.opacity = "1";
      (fig.querySelector(".ln-lbl") as SVGGElement).style.opacity = "1";
    }, 600);
    window.setTimeout(() => {
      face("curious");
      helper.innerHTML = "곡선 구간을 칠해 보니 바깥쪽 곡선이 눈에 띄게 <b>길어</b> 보여요. 계단식 출발선의 진짜 이유는 뭘까요?";
      window.setTimeout(() => {
        ask(box, helper, {
          choices: choices ?? [
            "바깥 레인의 곡선 길이가 더 길어서, 그 차이만큼 앞에서 출발해요",
            "바깥 선수가 기록이 좋아서 앞에 세워 줘요",
            "관중석에서 잘 보이게 하려는 연출이에요",
          ],
          good: "정확해요! 곡선(호)의 길이는 반지름이 클수록 길어져요. 그 차이를 정확히 계산해 출발선을 조절하죠. 그 계산의 주인공이 바로 오늘 만날 원주율 <b>π</b>예요!",
          bad: "실력도 연출도 아니고 <b>공정함</b> 때문이에요. 바깥 레인은 곡선(호)이 더 길어서, 모두가 같은 거리를 달리도록 그 차이만큼 앞에서 출발시켜요. 그 차이를 계산해 주는 도구가 오늘의 주인공 π!",
          onDone: finish,
        });
      }, 1000);
    }, 1500);
  });
};

/* ── 8 diamond, 다이아몬드는 58면체(다면체) ─────────────────────── */
export const renderDiamond: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  // 브릴리언트 컷 단면: 크라운(위) + 퍼빌리언(아래 뾰족) — 면 분할 라인
  fig.innerHTML = wrapSvg(
    `<rect x="20" y="8" width="320" height="184" rx="16" fill="url(#dm-bg)"/>
    ${SHADOW(180, 178, 74, 0.2)}
    <g class="dm-gem">
      <path d="M104 78 L136 46 L224 46 L256 78 Z" fill="url(#dm-cr)" stroke="#7A8FB0" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M104 78 L256 78 L180 166 Z" fill="url(#dm-pv)" stroke="#7A8FB0" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M136 46 L152 78 M224 46 L208 78 M180 46 L180 78 M152 78 L136 46 M152 78 L180 46 M208 78 L180 46" stroke="#AFC2DC" stroke-width="1.1" opacity=".9"/>
      <path d="M104 78 L152 78 L180 166 M256 78 L208 78 L180 166 M152 78 L180 166 M208 78 L180 166 M180 78 L180 166" stroke="#AFC2DC" stroke-width="1.1" opacity=".75"/>
      <path d="M120 60 L150 55" stroke="#FFFFFF" stroke-width="2.2" opacity=".8" stroke-linecap="round"/>
      <g class="dm-spark" style="opacity:0; transition: opacity .6s">
        <path d="M92 40 l4 8 8 4 -8 4 -4 8 -4 -8 -8 -4 8 -4 Z" fill="#FFF6C9"/>
        <path d="M268 118 l3 6 6 3 -6 3 -3 6 -3 -6 -6 -3 6 -3 Z" fill="#FFF6C9" opacity=".9"/>
      </g>
    </g>`,
    `<linearGradient id="dm-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1B2A44"/><stop offset=".55" stop-color="#12203A"/><stop offset="1" stop-color="#0B1524"/></linearGradient>
    <linearGradient id="dm-cr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2F8FF"/><stop offset="1" stop-color="#C3D8F2"/></linearGradient>
    <linearGradient id="dm-pv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BFD5F0"/><stop offset=".6" stop-color="#8FB2DC"/><stop offset="1" stop-color="#6C93C4"/></linearGradient>`,
  );
  const btn = mkBtn("불빛에 비춰 보기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "보석 가게의 <b>다이아몬드</b>, 유리구슬과 달리 눈부시게 반짝여요. 표면을 자세히 보면 <b>평평한 면</b>들이 잔뜩 붙어 있는데요?";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    (fig.querySelector(".dm-spark") as SVGGElement).style.opacity = "1";
    window.setTimeout(() => {
      face("curious");
      helper.innerHTML = "반짝임의 비밀은 <b>정확히 58개</b>로 깎인 평평한 면! 이렇게 평평한 다각형 면으로만 둘러싸인 입체를 수학에서는 뭐라고 부를까요?";
      window.setTimeout(() => {
        ask(box, helper, {
          choices: choices ?? [
            "58면체, 면의 개수로 이름을 붙여요",
            "58각형이라고 불러요",
            "둥글게 다듬은 구슬이라 구예요",
          ],
          good: "정확해요! 면이 58개면 <b>58면체</b>, 면의 개수가 곧 이름이에요. 이런 입체를 통틀어 다면체라고 하죠. 다면체의 세계로 들어가 부품(면·모서리·꼭짓점)을 세러 가요!",
          bad: "각형은 평면도형(2차원)의 이름이고, 구는 곡면이라 반짝이는 면이 없어요. 평평한 면 58개로 둘러싸였으니 <b>58면체</b>! 면의 개수로 이름 짓는 다면체의 세계로 가요.",
          onDone: finish,
        });
      }, 900);
    }, 900);
  });
};

/* ── 9 dicegame, 주사위는 왜 5종뿐(정다면체) ────────────────────── */
export const renderDicegame: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  // 보드게임 주사위 5종 실루엣(D4·D6·D8·D12·D20)
  fig.innerHTML = wrapSvg(
    `<rect x="14" y="10" width="332" height="182" rx="16" fill="url(#dg-tbl)"/>
    ${SHADOW(60, 156, 26, 0.16)}${SHADOW(126, 160, 28, 0.16)}${SHADOW(196, 158, 26, 0.16)}${SHADOW(262, 158, 28, 0.16)}${SHADOW(318, 152, 22, 0.16)}
    <g class="dg-d4"><path d="M60 96 L36 148 L84 148 Z" fill="url(#dg-a)" stroke="#8C1F30" stroke-width="1.6" stroke-linejoin="round"/><path d="M60 96 L60 148" stroke="#8C1F30" stroke-width="1" opacity=".6"/><text x="56" y="138" font-size="12" font-weight="900" fill="#FFF">4</text></g>
    <g class="dg-d6"><path d="M104 118 L126 106 L148 118 L148 144 L126 156 L104 144 Z" fill="url(#dg-b)" stroke="#1E5B8C" stroke-width="1.6" stroke-linejoin="round"/><path d="M104 118 L126 130 L148 118 M126 130 L126 156" stroke="#1E5B8C" stroke-width="1.1" opacity=".7"/><text x="120" y="149" font-size="12" font-weight="900" fill="#FFF">6</text></g>
    <g class="dg-d8"><path d="M196 100 L222 130 L196 160 L170 130 Z" fill="url(#dg-c)" stroke="#1E7A31" stroke-width="1.6" stroke-linejoin="round"/><path d="M196 100 L196 160 M170 130 L222 130" stroke="#1E7A31" stroke-width="1.1" opacity=".7"/><text x="188" y="134" font-size="12" font-weight="900" fill="#FFF">8</text></g>
    <g class="dg-d12"><path d="M262 102 L288 116 L282 146 L242 146 L236 116 Z" fill="url(#dg-d)" stroke="#8C5A12" stroke-width="1.6" stroke-linejoin="round"/><path d="M262 102 L262 120 M236 116 L262 120 L288 116 M242 146 L262 120 M282 146 L262 120" stroke="#8C5A12" stroke-width="1" opacity=".55"/><text x="252" y="140" font-size="11.5" font-weight="900" fill="#FFF">12</text></g>
    <g class="dg-d20"><path d="M318 100 L340 138 L318 168 L296 138 Z" fill="url(#dg-e)" stroke="#5F42C9" stroke-width="1.6" stroke-linejoin="round"/><path d="M296 138 L318 128 L340 138 M318 128 L318 168" stroke="#5F42C9" stroke-width="1" opacity=".6"/><text x="310" y="150" font-size="11.5" font-weight="900" fill="#FFF">20</text></g>
    <g class="dg-q" style="opacity:0; transition: opacity .6s">
      <circle cx="180" cy="52" r="22" fill="none" stroke="#FFD44A" stroke-width="2.4" stroke-dasharray="6 6"/>
      <text x="172" y="60" font-size="22" font-weight="900" fill="#FFD44A">?</text>
    </g>`,
    `<linearGradient id="dg-tbl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2E4A38"/><stop offset=".55" stop-color="#25402F"/><stop offset="1" stop-color="#1B3224"/></linearGradient>
    <linearGradient id="dg-a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F27D8E"/><stop offset="1" stop-color="#C93A52"/></linearGradient>
    <linearGradient id="dg-b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6FB4E8"/><stop offset="1" stop-color="#2F7AB8"/></linearGradient>
    <linearGradient id="dg-c" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7ACF8B"/><stop offset="1" stop-color="#2F9E44"/></linearGradient>
    <linearGradient id="dg-d" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F2C468"/><stop offset="1" stop-color="#D89A1E"/></linearGradient>
    <linearGradient id="dg-e" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#B5A0F6"/><stop offset="1" stop-color="#7C5CE8"/></linearGradient>`,
  );
  const btn = mkBtn("6종 주사위 찾아보기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "보드게임 가게의 <b>주사위 세트</b>예요. 4면·6면·8면·12면·20면, 모든 면이 <b>완전히 똑같아서 공평한</b> 주사위는 딱 이 다섯 가지뿐이래요.";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    (fig.querySelector(".dg-q") as SVGGElement).style.opacity = "1";
    window.setTimeout(() => {
      face("curious");
      helper.innerHTML = "10면짜리, 14면짜리 <b>완전 공평 주사위</b>는 아무리 찾아도 없어요. 다섯 가지에서 끝나는 이유가 뭘까요?";
      window.setTimeout(() => {
        ask(box, helper, {
          choices: choices ?? [
            "수학적으로 다섯 가지밖에 존재할 수 없어서예요",
            "여섯 번째부터는 만들기 너무 어려워서예요",
            "게임 규칙이 다섯 가지로 정해서예요",
          ],
          good: "정확해요! 기술이나 규칙의 문제가 아니라 <b>수학이 금지</b>한 거예요. 우주 어디에서도 여섯 번째는 못 만들죠. 그 증명을 지금 여러분 손으로 직접 해 봐요!",
          bad: "3D 프린터로도, 어떤 규칙으로도 여섯 번째는 <b>불가능</b>해요. 기술이 아니라 수학이 다섯 가지만 허락했거든요. 왜 다섯인지, 지금 여러분 손으로 직접 증명해 봐요!",
          onDone: finish,
        });
      }, 900);
    }, 800);
  });
};

/* ── 10 pottery, 도자기 물레(회전체) ────────────────────────────── */
export const renderPottery: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  fig.innerHTML = wrapSvg(
    `<rect x="14" y="10" width="332" height="182" rx="16" fill="url(#pt-rm)"/>
    ${SHADOW(180, 184, 88, 0.16)}
    <ellipse cx="180" cy="168" rx="84" ry="12" fill="url(#pt-wh)" stroke="#4A3418" stroke-width="1.8"/>
    <ellipse cx="180" cy="163" rx="84" ry="12" fill="url(#pt-wh2)" stroke="#4A3418" stroke-width="1.6"/>
    <g class="pt-clay">
      <path class="pt-half" d="M180 70 Q216 76 222 100 Q228 126 202 138 Q192 143 194 156 L180 156 Z" fill="url(#pt-cl)" stroke="#8C5A2E" stroke-width="1.8" style="opacity:1; transition: opacity .5s"/>
      <path class="pt-full" d="M180 70 Q216 76 222 100 Q228 126 202 138 Q192 143 194 156 L166 156 Q168 143 158 138 Q132 126 138 100 Q144 76 180 70 Z" fill="url(#pt-cl)" stroke="#8C5A2E" stroke-width="1.8" style="opacity:0; transition: opacity .5s"/>
      <ellipse class="pt-rim" cx="180" cy="72" rx="24" ry="6" fill="#B9834E" stroke="#8C5A2E" stroke-width="1.4" style="opacity:0; transition: opacity .5s"/>
      <line x1="180" y1="52" x2="180" y2="162" stroke="#5C6E80" stroke-width="1.6" stroke-dasharray="6 5"/>
    </g>
    <g class="pt-spin" style="opacity:0; transition: opacity .4s">
      <path d="M108 96 q-14 22 4 44" stroke="#EAF2FA" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".7"/>
      <path d="M252 96 q14 22 -4 44" stroke="#EAF2FA" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".7"/>
    </g>`,
    `<linearGradient id="pt-rm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3E3428"/><stop offset=".55" stop-color="#332A20"/><stop offset="1" stop-color="#261F17"/></linearGradient>
    <linearGradient id="pt-wh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6B4E28"/><stop offset="1" stop-color="#4A3418"/></linearGradient>
    <linearGradient id="pt-wh2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8C6A3A"/><stop offset="1" stop-color="#6B4E28"/></linearGradient>
    <linearGradient id="pt-cl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#D9A868"/><stop offset=".55" stop-color="#C08C4A"/><stop offset="1" stop-color="#9C6F36"/></linearGradient>`,
  );
  const btn = mkBtn("물레 돌리기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "도예 체험장의 <b>물레</b>예요. 지금 점토는 <b>반쪽</b>만 빚어진 상태! 물레를 돌리면 어떻게 될까요?";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    (fig.querySelector(".pt-spin") as SVGGElement).style.opacity = "1";
    window.setTimeout(() => {
      (fig.querySelector(".pt-half") as SVGPathElement).style.opacity = "0";
      (fig.querySelector(".pt-full") as SVGPathElement).style.opacity = "1";
      (fig.querySelector(".pt-rim") as SVGEllipseElement).style.opacity = "1";
      haptic(HAPTIC.correct);
    }, 900);
    window.setTimeout(() => {
      face("surprised");
      helper.innerHTML = "빙글빙글 돌자 반쪽이 <b>완전한 항아리</b>가 됐어요! 도자기가 어느 방향에서 봐도 똑같이 둥근 이유는 뭘까요?";
      window.setTimeout(() => {
        ask(box, helper, {
          choices: choices ?? [
            "한 단면이 축 둘레를 돌면서 만든 입체라서예요",
            "장인이 사방을 일일이 둥글게 다듬어서예요",
            "점토가 원래 둥근 성질이 있어서예요",
          ],
          good: "정확해요! 반쪽 단면 하나가 <b>축을 중심으로 한 바퀴</b> 돌며 온몸을 만든 거예요. 이렇게 태어난 입체들의 정식 이름이 있죠. 이제 여러분이 직접 물레를 돌려 봐요!",
          bad: "다듬은 것도, 점토의 성질도 아니에요. 비밀은 <b>회전</b>! 반쪽 단면이 축 둘레를 한 바퀴 돌며 모든 방향을 똑같이 만들었죠. 직접 물레를 돌려 확인해 봐요!",
          onDone: finish,
        });
      }, 1000);
    }, 1900);
  });
};

/* ── 11 drinkcan, 캔이 죄다 원기둥인 이유(기둥의 겉넓이·부피) ────── */
export const renderDrinkcan: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  const can = (cx: number, kind: "tri" | "sq" | "cyl", label: string): string => {
    const h = 92;
    const y = 66;
    let body = "";
    if (kind === "cyl")
      body =
        `<ellipse cx="${cx}" cy="${y}" rx="30" ry="9" fill="url(#dc-tp)" stroke="#8C99A8" stroke-width="1.4"/>` +
        `<path d="M${cx - 30} ${y} V${y + h} A30 9 0 0 0 ${cx + 30} ${y + h} V${y}" fill="url(#dc-bd)" stroke="#8C99A8" stroke-width="1.4"/>` +
        `<ellipse cx="${cx - 10}" cy="${y + h / 2}" rx="5" ry="26" fill="#fff" opacity=".35"/>`;
    else if (kind === "sq")
      body =
        `<path d="M${cx - 26} ${y - 4} L${cx + 8} ${y - 8} L${cx + 26} ${y + 2} L${cx - 8} ${y + 6} Z" fill="url(#dc-tp)" stroke="#8C99A8" stroke-width="1.4"/>` +
        `<path d="M${cx - 26} ${y - 4} V${y + h - 4} L${cx - 8} ${y + h + 6} V${y + 6} Z M${cx - 8} ${y + 6} V${y + h + 6} L${cx + 26} ${y + h + 2} V${y + 2} Z" fill="url(#dc-bd)" stroke="#8C99A8" stroke-width="1.4"/>`;
    else
      body =
        `<path d="M${cx - 28} ${y + 4} L${cx + 28} ${y + 4} L${cx} ${y - 10} Z" fill="url(#dc-tp)" stroke="#8C99A8" stroke-width="1.4"/>` +
        `<path d="M${cx - 28} ${y + 4} V${y + h + 4} L${cx + 28} ${y + h + 4} V${y + 4} Z" fill="url(#dc-bd)" stroke="#8C99A8" stroke-width="1.4"/>` +
        `<path d="M${cx} ${y - 10} V${y + h - 10}" stroke="#8C99A8" stroke-width="1.2" opacity=".6"/>`;
    return `${SHADOW(cx, y + h + 12, 34, 0.14)}${body}<text x="${cx}" y="${y + h + 30}" text-anchor="middle" font-size="11" font-weight="800" fill="#5C6E80">${label}</text>`;
  };
  fig.innerHTML = wrapSvg(
    `<rect x="16" y="12" width="328" height="178" rx="16" fill="url(#dc-bg)"/>
    ${can(70, "tri", "삼각기둥 캔?")}${can(180, "sq", "사각기둥 캔?")}${can(290, "cyl", "원기둥 캔!")}
    <g class="dc-tag" style="opacity:0; transition: opacity .6s">
      <rect x="236" y="30" width="108" height="22" rx="11" fill="#2F9E44"/>
      <text x="290" y="45" text-anchor="middle" font-size="11.5" font-weight="900" fill="#fff">재료 최소 우승!</text>
    </g>`,
    `<linearGradient id="dc-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2F7FB"/><stop offset="1" stop-color="#DFE9F2"/></linearGradient>
    <linearGradient id="dc-tp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E8EEF4"/><stop offset="1" stop-color="#C2CCD8"/></linearGradient>
    <linearGradient id="dc-bd" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#D8E2EC"/><stop offset=".5" stop-color="#B9C6D4"/><stop offset="1" stop-color="#9AA8B8"/></linearGradient>`,
  );
  const btn = mkBtn("같은 양 담는 캔 대결");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "편의점 음료 캔은 <b>죄다 원기둥</b>이에요. 삼각기둥 캔, 사각기둥 캔은 왜 없을까요? 셋 다 <b>같은 양</b>을 담는다고 하고 대결을 붙여 봐요!";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    (fig.querySelector(".dc-tag") as SVGGElement).style.opacity = "1";
    window.setTimeout(() => {
      face("curious");
      helper.innerHTML = "부피(담는 양)가 같을 때, <b>겉을 감싸는 재료</b>가 가장 적게 드는 쪽은 원기둥이래요. 그럼 캔 공장이 원기둥을 고른 이유는?";
      window.setTimeout(() => {
        ask(box, helper, {
          choices: choices ?? [
            "같은 부피일 때 겉넓이가 가장 작아 재료비가 적게 들어서예요",
            "원기둥이 만들기 제일 쉬워서예요",
            "손에 쥐기 좋아서일 뿐, 수학과는 관계없어요",
          ],
          good: "정확해요! 같은 부피면 원기둥의 <b>겉넓이가 최소</b>, 캔 하나마다 재료를 아끼죠. 겉넓이와 부피, 이 두 값을 계산하는 법을 지금 배워요!",
          bad: "그립감도 공정도 부수적이에요. 진짜 이유는 <b>같은 부피일 때 겉넓이가 가장 작다</b>는 수학! 캔 수억 개면 재료비 차이가 어마어마하거든요. 겉넓이와 부피 계산법을 배우러 가요!",
          onDone: finish,
        });
      }, 900);
    }, 900);
  });
};

/* ── 12 partyhat, 고깔모자를 펼치면(뿔의 전개도) ────────────────── */
export const renderPartyhat: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  fig.innerHTML = wrapSvg(
    `<rect x="16" y="12" width="328" height="178" rx="16" fill="url(#ph-bg)"/>
    ${SHADOW(110, 172, 56, 0.14)}
    <g class="ph-hat">
      <path d="M110 44 L64 160 A46 12 0 0 0 156 160 Z" fill="url(#ph-cn)" stroke="#B0662A" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M92 90 q18 10 38 2 M78 126 q30 14 62 2" stroke="#FFFFFF" stroke-width="3" opacity=".5" fill="none"/>
      <circle cx="110" cy="42" r="7" fill="url(#ph-pom)" stroke="#B23A48" stroke-width="1.2"/>
    </g>
    <g class="ph-flat" style="opacity:0; transition: opacity .7s">
      <path d="M258 128 L212 74 A72 72 0 0 1 304 74 Z" fill="url(#ph-cn)" stroke="#B0662A" stroke-width="1.8" stroke-linejoin="round"/>
      <text x="258" y="152" text-anchor="middle" font-size="11.5" font-weight="800" fill="#B0662A">펼친 모습</text>
    </g>`,
    `<linearGradient id="ph-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBF4FF"/><stop offset="1" stop-color="#EFE2F8"/></linearGradient>
    <linearGradient id="ph-cn" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFD98A"/><stop offset=".55" stop-color="#F2A65A"/><stop offset="1" stop-color="#E08A3C"/></linearGradient>
    <radialGradient id="ph-pom" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#FF9AA2"/><stop offset="1" stop-color="#E85D75"/></radialGradient>`,
  );
  const btn = mkBtn("옆선 가위로 자르기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "생일 파티의 <b>고깔모자</b>! 옆선을 가위로 쭉 잘라 평평하게 펼치면 무슨 모양이 나올까요? 머릿속으로 먼저 그려 봐요.";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    (fig.querySelector(".ph-flat") as SVGGElement).style.opacity = "1";
    window.setTimeout(() => {
      face("surprised");
      helper.innerHTML = "삼각형이 아니라 <b>부채꼴</b>이 나왔어요! 왜 뾰족한 고깔이 둥근 부채꼴로 펼쳐질까요?";
      window.setTimeout(() => {
        ask(box, helper, {
          choices: choices ?? [
            "꼭짓점에서 테두리까지의 거리가 어디서나 같아서예요",
            "종이가 곡선으로 휘어 있던 흔적이 남아서예요",
            "가위질이 비뚤어져서 그런 거예요",
          ],
          good: "정확해요! 고깔 꼭대기에서 모자 테두리까지는 어느 방향이든 <b>같은 거리(모선)</b>죠. 한 점에서 같은 거리의 점들을 펼치면 원의 일부, 부채꼴! 이 발견이 원뿔 겉넓이의 열쇠예요.",
          bad: "흔적도 실수도 아니에요. 꼭대기에서 테두리까지가 어느 방향이든 <b>같은 거리</b>라, 펼치면 반지름이 일정한 <b>부채꼴</b>이 되는 거예요. 이 발견이 원뿔 겉넓이의 열쇠!",
          onDone: finish,
        });
      }, 1000);
    }, 1000);
  });
};

/* ── 13 balloonup, 풍선 2배의 비밀(구의 겉넓이·부피) ────────────── */
export const renderBalloonup: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  fig.innerHTML = wrapSvg(
    `<rect x="16" y="12" width="328" height="178" rx="16" fill="url(#bl-bg)"/>
    ${SHADOW(96, 178, 30, 0.13)}
    <g class="bl-a">
      <circle cx="96" cy="112" r="34" fill="url(#bl-rd)" stroke="#B23A48" stroke-width="1.6"/>
      <ellipse cx="84" cy="98" rx="10" ry="7" fill="#fff" opacity=".4"/>
      <path d="M96 146 l-5 9 h10 Z" fill="#B23A48"/>
      <path d="M96 155 q-4 12 2 22" stroke="#8093A8" stroke-width="1.6" fill="none"/>
      <text x="96" y="60" text-anchor="middle" font-size="11.5" font-weight="800" fill="#5C6E80">반지름 r</text>
    </g>
    <g class="bl-b" style="opacity:0; transition: opacity .7s">
      ${SHADOW(240, 186, 52, 0.13)}
      <circle cx="240" cy="106" r="68" fill="url(#bl-rd)" stroke="#B23A48" stroke-width="1.8"/>
      <ellipse cx="216" cy="78" rx="18" ry="12" fill="#fff" opacity=".4"/>
      <path d="M240 174 l-6 10 h12 Z" fill="#B23A48"/>
      <text x="240" y="28" text-anchor="middle" font-size="11.5" font-weight="800" fill="#5C6E80">반지름 2r</text>
    </g>`,
    `<linearGradient id="bl-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F0F8FF"/><stop offset="1" stop-color="#DCEDF8"/></linearGradient>
    <radialGradient id="bl-rd" cx=".38" cy=".32" r="1"><stop offset="0" stop-color="#FF8B94"/><stop offset=".6" stop-color="#F25864"/><stop offset="1" stop-color="#D93A4C"/></radialGradient>`,
  );
  const btn = mkBtn("두 배 크기로 불기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "풍선을 후후 불어 <b>반지름이 딱 2배</b>가 되게 했어요. 그럼 풍선의 <b>고무(겉면)</b>와 <b>공기(속)</b>도 2배가 될까요?";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    (fig.querySelector(".bl-b") as SVGGElement).style.opacity = "1";
    window.setTimeout(() => {
      face("curious");
      helper.innerHTML = "확실히 2배보다 <b>훨씬 커</b> 보여요. 반지름 2배일 때 고무(겉넓이)와 공기(부피)는 각각 몇 배일까요?";
      window.setTimeout(() => {
        ask(box, helper, {
          choices: choices ?? [
            "고무는 4배, 공기는 8배가 돼요",
            "고무도 공기도 2배가 돼요",
            "고무도 공기도 4배가 돼요",
          ],
          good: "정확해요! 겉넓이는 r²에 비례해 2²=<b>4배</b>, 부피는 r³에 비례해 2³=<b>8배</b>! 이 제곱·세제곱의 마법을 공식으로 확인하러 가요.",
          bad: "겉은 <b>넓이</b>라 r², 속은 <b>부피</b>라 r³을 따라가요. 반지름 2배면 고무는 2²=4배, 공기는 2³=<b>8배</b>! 숨이 두 배로 드는 게 아니라 여덟 배로 들죠. 공식으로 확인하러 가요!",
          onDone: finish,
        });
      }, 1000);
    }, 900);
  });
};

/* ── 14 tombstone, 아르키메데스의 묘비(부피 비율 3:2:1) ──────────────────── */
export const renderTombstone: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  fig.innerHTML = wrapSvg(
    `<rect x="16" y="12" width="328" height="178" rx="16" fill="url(#tb-sky)"/>
    <ellipse cx="180" cy="182" rx="140" ry="14" fill="#4A5A3E"/>
    <path d="M60 176 q20 -26 8 -48 M74 176 q-16 -20 -6 -40 M292 176 q18 -24 6 -44 M306 176 q-14 -18 -4 -36" stroke="#5C7A48" stroke-width="5" fill="none" stroke-linecap="round" opacity=".85"/>
    ${SHADOW(180, 178, 74, 0.2)}
    <path d="M118 176 V70 a62 52 0 0 1 124 0 V176 Z" fill="url(#tb-st)" stroke="#6B7568" stroke-width="2"/>
    <path d="M132 88 q10 -8 22 -4" stroke="#FFFFFF" stroke-width="2.4" opacity=".35" fill="none"/>
    <g class="tb-carve" style="opacity:0; transition: opacity .8s">
      <rect x="146" y="86" width="68" height="74" rx="4" fill="none" stroke="#3E4A3C" stroke-width="2.6"/>
      <circle cx="180" cy="123" r="34" fill="none" stroke="#3E4A3C" stroke-width="2.6"/>
      <path d="M146 160 L180 89 L214 160" fill="none" stroke="#3E4A3C" stroke-width="2.2" stroke-dasharray="5 4"/>
    </g>`,
    `<linearGradient id="tb-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D8E6D2"/><stop offset=".6" stop-color="#B8CFAE"/><stop offset="1" stop-color="#96B489"/></linearGradient>
    <linearGradient id="tb-st" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#C6CCC0"/><stop offset=".55" stop-color="#A8B0A2"/><stop offset="1" stop-color="#8A9284"/></linearGradient>`,
  );
  const btn = mkBtn("이끼 걷어 내기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "2,200년 전 시칠리아. 무성한 잡초 속에서 로마의 학자 키케로가 <b>전설의 수학자 아르키메데스의 묘비</b>를 찾아냈어요. 묘비에는 글자 대신 <b>그림 하나</b>가 새겨져 있었대요.";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    (fig.querySelector(".tb-carve") as SVGGElement).style.opacity = "1";
    window.setTimeout(() => {
      face("surprised");
      helper.innerHTML = "<b>원기둥에 꼭 맞게 들어간 구와 원뿔</b>! 수많은 업적 중 아르키메데스가 하필 이 그림을 무덤에 새겨 달라고 한 이유는 뭘까요?";
      window.setTimeout(() => {
        ask(box, helper, {
          choices: choices ?? [
            "세 입체의 부피가 3:2:1이라는 발견을 가장 자랑스러워해서예요",
            "생전에 좋아하던 컵 모양이라서예요",
            "묘비 장식으로 유행하던 무늬라서예요",
          ],
          good: "정확해요! 원기둥:구:원뿔 = <b>3:2:1</b>, 이 우아한 비율의 발견을 그는 최고의 업적으로 여겼죠. 이번 레슨에서 이 전설의 비율을 여러분이 직접 검산합니다!",
          bad: "컵도 유행도 아니에요. 그 그림은 원기둥:구:원뿔의 부피가 <b>3:2:1</b>이라는 그의 최고 발견! 무덤까지 가져간 자부심이죠. 이번 레슨에서 직접 검산해 봐요!",
          onDone: finish,
        });
      }, 1000);
    }, 1000);
  });
};

/* ── 4 robotvac, 로봇청소기 한 바퀴(외각의 합 360°) ─────────────── */
export const renderRobotvac: SceneFn = (scene, helper, finish, face, choices) => {
  // 사각형 방(위에서 본 평면도) — 로봇이 벽을 따라 한 바퀴, 모퉁이마다 +90°.
  const SQ = [
    { x: 96, y: 60 },
    { x: 264, y: 60 },
    { x: 264, y: 156 },
    { x: 96, y: 156 },
  ];
  const sqPath = `M${P(SQ[0].x, SQ[0].y)} L${P(SQ[1].x, SQ[1].y)} L${P(SQ[2].x, SQ[2].y)} L${P(SQ[3].x, SQ[3].y)} Z`;
  const fig = el("div", {});
  fig.innerHTML = wrapSvg(
    `<rect x="24" y="10" width="312" height="180" rx="14" fill="url(#rv-fl)" stroke="#C9B79B" stroke-width="1.6"/>
    <rect x="36" y="22" width="288" height="156" rx="8" fill="none" stroke="#B99F78" stroke-width="3" opacity=".7"/>
    <rect x="270" y="30" width="44" height="26" rx="4" fill="url(#rv-bed)" stroke="#8A9AAC" stroke-width="1.2"/>
    <rect x="46" y="132" width="30" height="38" rx="4" fill="url(#rv-bed)" stroke="#8A9AAC" stroke-width="1.2" opacity=".9"/>
    <path class="rv-route" d="${sqPath}" stroke="#2F9E44" stroke-width="2.2" stroke-dasharray="5 6" opacity=".65"/>
    <g class="rv-turns"></g>
    <g class="rv-bot" style="opacity:1">
      <circle cx="0" cy="0" r="13" fill="url(#rv-bd)" stroke="#22303F" stroke-width="1.6"/>
      <circle cx="0" cy="0" r="6.5" fill="none" stroke="#EAF2FA" stroke-width="1.4" opacity=".8"/>
      <rect x="6" y="-3" width="6" height="6" rx="1.5" fill="#63E6BE"/>
    </g>
    <g transform="translate(304 168)">
      <rect x="-13" y="-24" width="26" height="30" rx="5" fill="url(#rv-dock)" stroke="#22303F" stroke-width="1.3"/>
      <circle cx="0" cy="-16" r="2.6" fill="#63E6BE"/>
    </g>`,
    `<linearGradient id="rv-fl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F2E8D4"/><stop offset=".55" stop-color="#EADCC0"/><stop offset="1" stop-color="#DECBA6"/></linearGradient>
    <linearGradient id="rv-bed" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#DCE6F0"/><stop offset="1" stop-color="#B9C8D8"/></linearGradient>
    <radialGradient id="rv-bd" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#5A7A9C"/><stop offset=".55" stop-color="#3A5474"/><stop offset="1" stop-color="#2A3E58"/></radialGradient>
    <linearGradient id="rv-dock" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4A6284"/><stop offset="1" stop-color="#32455E"/></linearGradient>`,
  );
  const meter = el("div", { class: "rv-meter", html: `돈 각도 합계: <b>0°</b>` });
  const btn = mkBtn("벽 따라 한 바퀴 청소");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, meter, btn, box);
  helper.innerHTML = "우리 집 <b>로봇청소기</b>는 벽을 따라 방을 한 바퀴 돌아요. 모퉁이를 만날 때마다 몸을 <b>휙 돌리죠</b>. 출발부터 제자리로 돌아올 때까지, 돈 각도를 전부 더해 볼까요?";

  const bot = fig.querySelector(".rv-bot") as SVGGElement;
  const setBot = (x: number, y: number): void => {
    bot.style.transition = "transform .9s ease-in-out";
    bot.style.transform = `translate(${x}px, ${y}px)`;
  };
  bot.style.transform = `translate(${SQ[0].x}px, ${SQ[0].y}px)`;

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    let sum = 0;
    const legs = [1, 2, 3, 0]; // 도착 꼭짓점 순서
    legs.forEach((vi, i) => {
      window.setTimeout(() => {
        setBot(SQ[vi].x, SQ[vi].y);
        window.setTimeout(() => {
          sum += 90;
          haptic(HAPTIC.tap);
          const v = SQ[vi];
          const g = fig.querySelector(".rv-turns") as SVGGElement;
          g.insertAdjacentHTML(
            "beforeend",
            `<g style="opacity:0; transition: opacity .35s">
              <circle cx="${v.x}" cy="${v.y}" r="17" fill="#2F9E44" opacity=".14"/>
              <text x="${v.x}" y="${v.y - 22 * (v.y < 100 ? 1 : -1.4)}" text-anchor="middle" font-size="12" font-weight="800" fill="#1E7A31">+90°</text>
            </g>`,
          );
          window.setTimeout(() => ((g.lastElementChild as SVGGElement).style.opacity = "1"), 20);
          (meter.querySelector("b") as HTMLElement).textContent = `${sum}°`;
        }, 950);
      }, i * 1450);
    });
    window.setTimeout(() => {
      face("curious");
      helper.innerHTML = "네 모퉁이에서 90°씩, 합계 <b>딱 360°</b>에 제자리로 돌아왔어요! 그런데 모퉁이가 <b>다섯 개</b>인 오각형 방이라면, 합계는 더 커질까요?";
      window.setTimeout(() => {
        ask(box, helper, {
          choices: choices ?? [
            "아니요, 몇 각형 방이든 합계는 딱 360°예요",
            "모퉁이가 많아지니 합계도 커져요",
            "방이 넓을수록 합계가 커져요",
          ],
          good: "정확해요! 모퉁이가 몇 개든 결국 <b>제자리로 돌아오는 한 바퀴</b>, 그래서 합계는 언제나 360°예요. 모퉁이에서 도는 이 각의 정식 이름과 비밀을 랩에서 직접 걸으며 확인해요!",
          bad: "모퉁이 수도 방 크기도 상관없어요. 어떤 방이든 한 바퀴 돌아 제자리라면 몸이 돈 총량은 <b>한 바퀴 = 360°</b>! 오각형 방이면 한 모퉁이엔 72°씩만 돌면 되죠. 랩에서 직접 걸어 봐요!",
          onDone: finish,
        });
      }, 1200);
    }, legs.length * 1450 + 500);
  });
};
