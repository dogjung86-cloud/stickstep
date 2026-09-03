// hookMatter3 — 중1 Ⅳ 「물질의 상태 변화」 v3 훅 4장면. hook.ts가 scene 이름으로 위임한다.
// 장면: bakerylane(L1 빵집 골목 냄새) · tiltbottles(L2 세 병 눕히기) · frozenbottle(L4 냉동실 생수병) ·
//       icewatch(L5 얼음물 컵의 온도계). L3·L6은 만화로 열어 훅이 없다.
// 공용 규칙: 예측은 반드시 hookAsk.ask()(choices[0]=정답, good≠bad), 소재명은 도입에서 소개,
// 물리적 형태를 지킨다(병은 회전하되 물은 수평을 유지하며 흘러내리고, 병은 곡선으로 부푼다 — 순간 교체 금지).
// 스타일은 styles/matter3-hook.css(.hk4- 접두). 현행 hook.ts Ⅳ 장면(smell·juice·wrap·ramen)과 이름 무충돌.

import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { M3, stickSvg, type Pt } from "../../ui/matter3Kit";
import { ask } from "./hookAsk";

type Face = (kind: "smile" | "surprised" | "curious") => void;
interface HookLike {
  choices?: string[];
}

function keyTap(node: HTMLElement, fn: () => void): void {
  node.addEventListener("click", fn);
  node.addEventListener("keydown", (e) => {
    const k = e as KeyboardEvent;
    if (k.key === " " || k.key === "Enter") {
      k.preventDefault();
      fn();
    }
  });
}

/** 자가 예약 setTimeout 트윈(18틱·easeInOut). 장면이 DOM에서 떨어지면 멈춘다. 반환 = 취소 함수. */
function tween(fig: HTMLElement, ms: number, onTick: (e: number) => void, onDone?: () => void): () => void {
  const steps = 18;
  let n = 0;
  let id = 0;
  const stepFn = (): void => {
    if (!fig.isConnected) return;
    n += 1;
    const t = n / steps;
    const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    onTick(e);
    if (n < steps) id = window.setTimeout(stepFn, ms / steps);
    else onDone?.();
  };
  id = window.setTimeout(stepFn, ms / steps);
  return () => window.clearTimeout(id);
}

// ═══════════════════════════════════════════════════════════════════
// L1 bakerylane — 창문이 조금 열린 빵집에서 골목 끝까지 걸어가도 빵 냄새가 난다(바람은 없다).
// ═══════════════════════════════════════════════════════════════════
export function renderBakeryLane(scene: HTMLElement, helper: HTMLElement, s: HookLike, finish: () => void, face: Face): void {
  const fig = el("div", { class: "hk4-stage hk4-bl", attrs: { role: "button", tabindex: "0", "aria-label": "한 걸음 멀어지기" } });
  // 냄새 입자 — 빵집 창(60,96)에서 골목 끝까지 퍼진 최종 배치. 거리 순으로 1·2·3단계에 나타난다.
  const dots: [number, number, number][] = [
    [82, 92, 1], [96, 78, 1], [104, 104, 1], [118, 88, 1], [128, 70, 1],
    [146, 96, 2], [160, 80, 2], [172, 110, 2], [186, 90, 2], [198, 72, 2], [206, 104, 2],
    [226, 88, 3], [240, 100, 3], [254, 78, 3], [270, 94, 3], [286, 84, 3], [298, 106, 3],
  ];
  fig.innerHTML = `
  <svg viewBox="0 0 320 210" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="hk4blSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF6E8"/><stop offset="1" stop-color="#FFFDF9"/></linearGradient>
      <linearGradient id="hk4blWall" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFE8C2"/><stop offset="0.6" stop-color="#F5CE8F"/><stop offset="1" stop-color="#D9A75E"/></linearGradient>
      <linearGradient id="hk4blAwn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF8FA3"/><stop offset="1" stop-color="#D9536F"/></linearGradient>
      <linearGradient id="hk4blRoad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E9EDF2"/><stop offset="1" stop-color="#C9D3DE"/></linearGradient>
    </defs>
    <rect x="0" y="0" width="320" height="210" fill="url(#hk4blSky)"/>
    <rect x="0" y="150" width="320" height="60" fill="url(#hk4blRoad)"/>
    <path d="M0 150 h320" stroke="#B9C2CC" stroke-width="1.4"/>
    <g class="bl-shop">
      <rect x="6" y="46" width="74" height="104" rx="4" fill="url(#hk4blWall)" stroke="#B07A3C" stroke-width="1.6"/>
      <path d="M2 56 h82 l-6 -14 h-70 Z" fill="url(#hk4blAwn)" stroke="#A33D55" stroke-width="1.5"/>
      ${[0, 1, 2, 3].map((i) => `<path d="M${8 + i * 18} 56 q4 8 8 0" fill="#FFFFFF" opacity="0.6"/>`).join("")}
      <rect x="18" y="70" width="46" height="34" rx="3" fill="#FFF9EC" stroke="#B07A3C" stroke-width="1.5"/>
      <rect x="40" y="70" width="24" height="34" rx="2" fill="#FFF3D6" stroke="#B07A3C" stroke-width="1.2" opacity="0.9"/>
      <ellipse cx="30" cy="92" rx="9" ry="5" fill="#E0A85A" stroke="#A66A2C" stroke-width="1.2"/>
      <ellipse cx="50" cy="90" rx="8" ry="4.5" fill="#E9B46A" stroke="#A66A2C" stroke-width="1.2"/>
      <path d="M22 92 q4 -3 8 0 M44 90 q4 -3 8 0" stroke="#FFF" stroke-width="1.2" opacity="0.7" stroke-linecap="round"/>
      <rect x="24" y="116" width="26" height="34" rx="3" fill="#8A5A30" stroke="#5E3A1A" stroke-width="1.5"/>
      <circle cx="46" cy="134" r="1.8" fill="#F5D07A"/>
      <ellipse cx="43" cy="153" rx="42" ry="5" fill="#2A3A5E" opacity="0.10"/>
    </g>
    <g class="bl-flag">
      <rect x="292" y="54" width="3" height="96" fill="#8B95A1"/>
      <path d="M295 56 c4 6 6 16 3 30 l-3 -2 Z" fill="#74B9F0" stroke="#3B7DD8" stroke-width="1.2"/>
    </g>
    <g class="bl-dots">
      ${dots.map(([x, y, k]) => `<circle class="bl-dot bl-k${k}" cx="${x}" cy="${y}" r="3.2" fill="${M3.teal}" opacity="0"/>`).join("")}
    </g>
    <g class="bl-walker">
      ${stickSvg(0, 96, 1, "sniff")}
      <ellipse cx="0" cy="150" rx="18" ry="4" fill="#2A3A5E" opacity="0.12"/>
    </g>
    <text class="bl-note" x="200" y="196" text-anchor="middle" font-size="12" font-weight="800" fill="${M3.sub}">탭해서 한 걸음 멀어지기</text>
  </svg>`;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "골목 첫머리에 <b>빵집</b>이 있어요. 창문이 조금 열려 있고 갓 구운 빵이 진열돼 있죠. 장면을 <b>탭</b>해서 빵집에서 한 걸음씩 멀어져 보세요. 코가 뭐라고 하는지 지켜봐요.";

  const walker = fig.querySelector(".bl-walker") as SVGGElement;
  const note = fig.querySelector(".bl-note") as SVGTextElement;
  const xs = [104, 168, 236, 292];
  let step = 0;
  const place = (): void => {
    walker.style.transform = `translate(${xs[step]}px, 0)`;
  };
  walker.style.transition = "transform 0.55s cubic-bezier(.22,1,.36,1)";
  place();
  const walk = (): void => {
    if (step >= 3) return;
    step += 1;
    haptic(HAPTIC.tap);
    place();
    fig.classList.add(`on${step}`);
    if (step === 1) helper.innerHTML = "한 걸음. 아직 빵 냄새가 진하네요. 계속 멀어져 봐요.";
    if (step === 2) {
      face("curious");
      helper.innerHTML = "두 걸음. 냄새가 조금 옅어졌지만 여전히 나요. 한 걸음 더!";
    }
    if (step === 3) {
      face("surprised");
      note.textContent = "골목 끝, 바람 한 점 없음";
      helper.innerHTML = "골목 끝인데도 빵 냄새가 나요! 깃발이 축 처져 있으니 <b>바람은 없어요</b>. 냄새는 어떻게 여기까지 왔을까요?";
      window.setTimeout(() => {
        ask(choicesBox, helper, {
          choices: s.choices ?? [
            "빵 냄새를 이루는 입자가 스스로 움직여 사방으로 퍼져 나가서",
            "바람이 냄새를 골목 끝까지 실어 날라서",
            "빵집 문이 열릴 때마다 냄새가 한꺼번에 밀려 나와서",
          ],
          good: "정답! 냄새를 이루는 입자는 바람이 없어도 <b>스스로 끊임없이 움직여</b> 사방으로 퍼져요. 입자가 스스로 운동해 멀리 퍼져 나가는 이 현상에 이름이 있는데, 실험으로 직접 확인해 봐요.",
          bad: "깃발이 축 처져 있었죠? 바람도, 밀려 나온 것도 아니에요. 냄새를 이루는 <b>입자가 스스로 끊임없이 움직여</b> 사방으로 퍼져 나갔기 때문이에요. 이 현상의 이름을 실험으로 확인해요.",
          onDone: finish,
        });
      }, 800);
    }
  };
  keyTap(fig, walk);
}

// ═══════════════════════════════════════════════════════════════════
// L2 tiltbottles — 똑같은 병 세 개(돌·물·연기)를 눕히면 돌은 그대로, 물은 흘러 새 바닥에, 연기는 늘 병 전체.
// 물은 수평면을 유지하며 부피가 같도록 매 틱 계산(회전 사각형을 수평선으로 잘라 넓이 이분법).
// ═══════════════════════════════════════════════════════════════════
type Poly = Pt[];
const rot = (p: Pt, c: Pt, a: number): Pt => {
  const dx = p.x - c.x, dy = p.y - c.y;
  return { x: c.x + dx * Math.cos(a) - dy * Math.sin(a), y: c.y + dx * Math.sin(a) + dy * Math.cos(a) };
};
function rectPoly(c: Pt, w: number, h: number, a: number): Poly {
  return [
    { x: c.x - w / 2, y: c.y - h / 2 }, { x: c.x + w / 2, y: c.y - h / 2 },
    { x: c.x + w / 2, y: c.y + h / 2 }, { x: c.x - w / 2, y: c.y + h / 2 },
  ].map((p) => rot(p, c, a));
}
/** 수평선 y=L 아래(SVG y가 큰 쪽)만 남긴다. */
function clipBelow(poly: Poly, L: number): Poly {
  const out: Poly = [];
  for (let i = 0; i < poly.length; i++) {
    const A = poly[i], B = poly[(i + 1) % poly.length];
    const inA = A.y >= L, inB = B.y >= L;
    if (inA) out.push(A);
    if (inA !== inB) {
      const t = (L - A.y) / (B.y - A.y);
      out.push({ x: A.x + (B.x - A.x) * t, y: L });
    }
  }
  return out;
}
function polyArea(poly: Poly): number {
  let a = 0;
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i], q = poly[(i + 1) % poly.length];
    a += p.x * q.y - q.x * p.y;
  }
  return Math.abs(a) / 2;
}
function waterPoly(c: Pt, w: number, h: number, a: number, target: number): Poly {
  const rect = rectPoly(c, w, h, a);
  let lo = Math.min(...rect.map((p) => p.y)), hi = Math.max(...rect.map((p) => p.y));
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (polyArea(clipBelow(rect, mid)) > target) lo = mid;
    else hi = mid;
  }
  return clipBelow(rect, (lo + hi) / 2);
}
const polyD = (poly: Poly): string => (poly.length ? `M${poly.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L")} Z` : "");

export function renderTiltBottles(scene: HTMLElement, helper: HTMLElement, s: HookLike, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hk4-stage hk4-tb", attrs: { role: "button", tabindex: "0", "aria-label": "병 눕히기" } });
  const BW = 44, BH = 80, CY = 104;
  const CXS = [56, 160, 264];
  const centers: Pt[] = CXS.map((x) => ({ x, y: CY }));
  const bottleBody = (i: number): string => `<rect class="tb-body" x="${CXS[i] - BW / 2}" y="${CY - BH / 2}" width="${BW}" height="${BH}" rx="9"/>`;
  const bottleEdge = (i: number): string => `<rect class="tb-edge" x="${CXS[i] - BW / 2}" y="${CY - BH / 2}" width="${BW}" height="${BH}" rx="9"/>`;
  const bottleNeck = (i: number): string => `<path d="M${CXS[i] - 9} ${CY - BH / 2 + 2} v-9 a3 3 0 0 1 3 -3 h12 a3 3 0 0 1 3 3 v9" fill="#DCE6F0" stroke="#9DB2C4" stroke-width="2.2" stroke-linejoin="round"/>`;
  const rockD = (c: Pt): string => `M${c.x - 13} ${c.y + 4} l4 -11 l9 -4 l10 3 l5 8 l-3 8 l-10 4 l-11 -2 Z`;
  fig.innerHTML = `
  <svg viewBox="0 0 320 210" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="hk4tbGlass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#F4F9FF"/><stop offset="0.5" stop-color="#E4EEF8"/><stop offset="1" stop-color="#D3E0EE"/></linearGradient>
      <linearGradient id="hk4tbWater" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8FD0FF"/><stop offset="1" stop-color="#3D9BE0"/></linearGradient>
      <radialGradient id="hk4tbSmoke" cx="0.45" cy="0.4" r="0.8"><stop offset="0" stop-color="#F1F3F5"/><stop offset="0.65" stop-color="#C9D3DE"/><stop offset="1" stop-color="#9DB2C4"/></radialGradient>
      <radialGradient id="hk4tbRock" cx="0.35" cy="0.3" r="0.9"><stop offset="0" stop-color="#C3CBD4"/><stop offset="0.6" stop-color="#8B95A1"/><stop offset="1" stop-color="#5C6B7A"/></radialGradient>
      ${[0, 1, 2].map((i) => `<clipPath id="hk4tbClip${i}"><rect class="tb-clip" x="${CXS[i] - BW / 2 + 2}" y="${CY - BH / 2 + 2}" width="${BW - 4}" height="${BH - 4}" rx="7"/></clipPath>`).join("")}
    </defs>
    <rect x="0" y="0" width="320" height="210" fill="#FBFBFE"/>
    <rect x="0" y="158" width="320" height="52" fill="#EEF1F5"/>
    <path d="M0 158 h320" stroke="#C9D3DE" stroke-width="1.4"/>
    ${[0, 1, 2].map((i) => `<ellipse cx="${CXS[i]}" cy="160" rx="34" ry="5" fill="#2A3A5E" opacity="0.10"/>`).join("")}
    <g class="tb-glass">
      ${[0, 1, 2].map((i) => `<g class="tb-bottle" data-i="${i}">${bottleBody(i)}</g>`).join("")}
    </g>
    <g class="tb-inside">
      <g clip-path="url(#hk4tbClip1)"><path class="tb-water" d="" fill="url(#hk4tbWater)" opacity="0.85"/></g>
      <g class="tb-smokeg" clip-path="url(#hk4tbClip2)">
        <rect class="tb-smoke" x="${CXS[2] - BW / 2}" y="${CY - BH / 2}" width="${BW}" height="${BH}" fill="url(#hk4tbSmoke)" opacity="0.9"/>
        <path class="tb-wisp" d="M${CXS[2] - 12} ${CY + 30} q6 -12 0 -22 t0 -22 M${CXS[2] + 6} ${CY + 34} q6 -12 0 -22 t0 -22" stroke="#FFFFFF" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.7"/>
      </g>
      <path class="tb-rock" d="${rockD({ x: CXS[0], y: CY + BH / 2 - 16 })}" fill="url(#hk4tbRock)" stroke="#3E4A58" stroke-width="1.5" stroke-linejoin="round"/>
    </g>
    <g class="tb-bottles">
      ${[0, 1, 2].map((i) => `<g class="tb-bottle" data-i="${i}">${bottleNeck(i)}${bottleEdge(i)}<path d="M${CXS[i] - BW / 2 + 7} ${CY - BH / 2 + 12} v${BH - 26}" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" opacity="0.6"/></g>`).join("")}
    </g>
    ${["돌", "물", "연기"].map((t, i) => `<text x="${CXS[i]}" y="184" text-anchor="middle" font-size="13" font-weight="800" fill="${M3.ink}">${t}</text>`).join("")}
    <text class="tb-note" x="160" y="202" text-anchor="middle" font-size="12" font-weight="800" fill="${M3.sub}">탭해서 세 병 눕히기</text>
  </svg>`;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "똑같은 유리병 세 개에 <b>돌, 물, 향 연기</b>를 담았어요. 지금은 셋 다 병 아래쪽에 얌전히 있죠? 병을 <b>눕히면</b> 각각 어떻게 될까요? 장면을 <b>탭</b>해 보세요.";

  const water = fig.querySelector(".tb-water") as SVGPathElement;
  const rock = fig.querySelector(".tb-rock") as SVGPathElement;
  const bottles = Array.from(fig.querySelectorAll<SVGGElement>(".tb-bottle"));
  const clips = Array.from(fig.querySelectorAll<SVGRectElement>(".tb-clip"));
  const smokeG = fig.querySelector(".tb-smokeg") as SVGGElement;
  const note = fig.querySelector(".tb-note") as SVGTextElement;
  const WATER_AREA = (BW - 4) * (BH - 4) * 0.46;
  const rockStand: Pt = { x: CXS[0], y: CY + BH / 2 - 16 };
  // 시계 방향 90°: 입구가 오른쪽, 바닥(원래 아래)은 왼쪽, 원래 오른쪽 벽이 새 바닥이 된다 → 돌은 그 벽 쪽으로 내려앉는다.
  const rockLie: Pt = { x: CXS[0] - BH / 2 + 22, y: CY + BW / 2 - 12 };

  let lying = false;
  let asked = false;
  let cancel: (() => void) | null = null;
  const apply = (k: number): void => {
    const deg = 90 * k;
    bottles.forEach((g) => { const i = Number(g.dataset.i); g.setAttribute("transform", `rotate(${deg.toFixed(2)} ${CXS[i]} ${CY})`); });
    clips.forEach((c, i) => c.setAttribute("transform", `rotate(${deg.toFixed(2)} ${CXS[i]} ${CY})`));
    smokeG.setAttribute("transform", `rotate(${deg.toFixed(2)} ${CXS[2]} ${CY})`);
    water.setAttribute("d", polyD(waterPoly(centers[1], BW - 4, BH - 4, (deg * Math.PI) / 180, WATER_AREA)));
    const rc = { x: rockStand.x + (rockLie.x - rockStand.x) * k, y: rockStand.y + (rockLie.y - rockStand.y) * k };
    rock.setAttribute("d", rockD(rc));
  };
  apply(0);
  const toggle = (): void => {
    if (cancel) return;
    lying = !lying;
    haptic(HAPTIC.tap);
    const from = lying ? 0 : 1, to = lying ? 1 : 0;
    cancel = tween(fig, 700, (e) => apply(from + (to - from) * e), () => {
      cancel = null;
      if (lying && !asked) {
        asked = true;
        face("surprised");
        note.textContent = "돌은 그대로, 물은 흘러 고이고, 연기는 여전히 병 전체";
        helper.innerHTML = "돌은 <b>모양 그대로</b>예요. 물은 <b>흘러서 새 바닥에 고였지만</b> 양은 똑같고요. 연기는 눕히기 전에도 후에도 <b>병 전체</b>를 채우고 있죠. 물은 모양이 바뀌었는데 돌은 그대로예요. 이 차이는 어디서 올까요?";
        window.setTimeout(() => {
          ask(choicesBox, helper, {
            choices: s.choices ?? [
              "돌과 물을 이루는 입자들의 배열과 움직임이 서로 달라서",
              "돌이 물보다 무거워서",
              "물이 돌보다 온도가 높아서",
            ],
            good: "정답! 무게나 온도의 문제가 아니라, 돌·물·연기를 이루는 <b>입자들이 어떻게 배열되어 있고 얼마나 자유롭게 움직이는지</b>가 다르기 때문이에요. 입자의 눈으로 직접 들여다봐요. 한 번 더 탭하면 병이 다시 서요.",
            bad: "무게도 온도도 아니에요. 돌·물·연기는 저마다 <b>입자의 배열과 움직임</b>이 달라서 모양과 부피가 다르게 행동해요. 입자의 눈으로 확인해 봐요. 한 번 더 탭하면 병이 다시 서요.",
            onDone: finish,
          });
        }, 700);
      } else if (!lying) {
        note.textContent = "다시 세웠어요. 탭하면 또 눕힐 수 있어요";
      }
    });
  };
  keyTap(fig, toggle);
  return () => cancel?.();
}

// ═══════════════════════════════════════════════════════════════════
// L4 frozenbottle — 물을 가득 채운 생수병을 냉동실에 하룻밤 두면 빵빵하게 부푼다. 질량은? (예측)
// 병은 곡선으로 부푼다(양 옆 경로 d 보간 + 뚜껑 들림).
// ═══════════════════════════════════════════════════════════════════
export function renderFrozenBottle(scene: HTMLElement, helper: HTMLElement, s: HookLike, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hk4-stage hk4-fb", attrs: { role: "button", tabindex: "0", "aria-label": "냉동실에 넣기" } });
  const CX = 150, TOP = 46, BOT = 158, HW = 26;
  const bodyD = (k: number): string => {
    const b = 9 * k; // 옆면 부풂
    const t = -5 * k; // 어깨·바닥 부풂
    return `M${CX - HW} ${TOP + 14} Q${CX - HW - b} ${(TOP + BOT) / 2} ${CX - HW} ${BOT - 8 + t * 0.3} Q${CX - HW} ${BOT + t * 0.2} ${CX - HW + 8} ${BOT + t * 0.2} H${CX + HW - 8} Q${CX + HW} ${BOT + t * 0.2} ${CX + HW} ${BOT - 8 + t * 0.3} Q${CX + HW + b} ${(TOP + BOT) / 2} ${CX + HW} ${TOP + 14} Q${CX + HW} ${TOP + 4 + t} ${CX + 12} ${TOP + 2 + t} H${CX - 12} Q${CX - HW} ${TOP + 4 + t} ${CX - HW} ${TOP + 14} Z`;
  };
  fig.innerHTML = `
  <svg viewBox="0 0 320 210" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="hk4fbBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#F3F6FA"/></linearGradient>
      <linearGradient id="hk4fbCold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#DCEBFA"/><stop offset="1" stop-color="#EEF5FC"/></linearGradient>
      <linearGradient id="hk4fbWater" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9BD5FF"/><stop offset="0.55" stop-color="#5DB2F0"/><stop offset="1" stop-color="#3D93D6"/></linearGradient>
      <linearGradient id="hk4fbIce" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#F4FAFF"/><stop offset="0.55" stop-color="#CFE7FF"/><stop offset="1" stop-color="#A9D2F5"/></linearGradient>
      <linearGradient id="hk4fbCap" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6FB6FF"/><stop offset="1" stop-color="#2F7FD0"/></linearGradient>
    </defs>
    <rect class="fb-bg" x="0" y="0" width="320" height="210" fill="url(#hk4fbBg)"/>
    <rect class="fb-coldbg" x="0" y="0" width="320" height="210" fill="url(#hk4fbCold)" opacity="0"/>
    <g class="fb-frost" opacity="0">
      ${[[28, 64], [40, 122], [22, 172], [292, 86], [298, 134], [296, 178], [62, 200], [246, 202]].map(([x, y]) => `<path d="M${x - 6} ${y} h12 M${x} ${y - 6} v12 M${x - 4} ${y - 4} l8 8 M${x + 4} ${y - 4} l-8 8" stroke="#74B9F0" stroke-width="1.6" stroke-linecap="round"/>`).join("")}
    </g>
    <g class="fb-clock">
      <circle cx="270" cy="70" r="20" fill="#FFFFFF" stroke="#8B95A1" stroke-width="2.4"/>
      <path class="fb-hand" d="M270 70 v-13" stroke="${M3.ink}" stroke-width="2.6" stroke-linecap="round" style="transform-box: view-box; transform-origin: 270px 70px"/>
      <circle cx="270" cy="70" r="2" fill="${M3.ink}"/>
      <text x="270" y="104" text-anchor="middle" font-size="11" font-weight="800" fill="${M3.sub}">하룻밤</text>
    </g>
    <g class="fb-scale">
      <rect x="104" y="166" width="92" height="12" rx="3" fill="#C3CBD4" stroke="#8B95A1" stroke-width="1.5"/>
      <rect x="112" y="178" width="76" height="22" rx="6" fill="#E9EDF2" stroke="#8B95A1" stroke-width="1.8"/>
      <rect x="126" y="182" width="48" height="14" rx="3" fill="#1F2B3D"/>
      <text class="fb-read" x="150" y="193" text-anchor="middle" font-size="11" font-weight="800" fill="#7CF29C" font-family="ui-monospace, monospace">500 g</text>
    </g>
    <g class="fb-bottle">
      <path class="fb-fill fb-water" d="${bodyD(0)}" fill="url(#hk4fbWater)"/>
      <path class="fb-fill fb-ice" d="${bodyD(0)}" fill="url(#hk4fbIce)" opacity="0"/>
      <path class="fb-body" d="${bodyD(0)}" fill="none" stroke="#7FA6C8" stroke-width="2.4"/>
      <path class="fb-shine" d="M${CX - HW + 8} ${TOP + 24} v${BOT - TOP - 44}" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" opacity="0.7"/>
      <g class="fb-cap"><rect x="${CX - 12}" y="${TOP - 10}" width="24" height="14" rx="3" fill="url(#hk4fbCap)" stroke="#1F5FA6" stroke-width="1.6"/><path d="M${CX - 8} ${TOP - 6} h16" stroke="#FFFFFF" stroke-width="1.6" opacity="0.6"/></g>
      <path class="fb-crack" d="M${CX - 2} ${TOP + 20} l-6 18 l8 14 l-5 16" stroke="#FFFFFF" stroke-width="1.6" fill="none" opacity="0" stroke-linecap="round"/>
    </g>
    <text class="fb-note" x="150" y="30" text-anchor="middle" font-size="12" font-weight="800" fill="${M3.sub}">물을 가득 채운 생수병 · 탭해서 냉동실에 넣기</text>
  </svg>`;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "<b>생수병</b>에 물을 입구까지 가득 채우고 뚜껑을 꼭 닫았어요. 저울은 <b>500 g</b>. 이 병을 <b>냉동실</b>에 하룻밤 넣어 두면 어떻게 될까요? 장면을 <b>탭</b>해 보세요.";

  const fills = Array.from(fig.querySelectorAll<SVGPathElement>(".fb-fill"));
  const body = fig.querySelector(".fb-body") as SVGPathElement;
  const ice = fig.querySelector(".fb-ice") as SVGPathElement;
  const cap = fig.querySelector(".fb-cap") as SVGGElement;
  const hand = fig.querySelector(".fb-hand") as SVGPathElement;
  const read = fig.querySelector(".fb-read") as SVGTextElement;
  const note = fig.querySelector(".fb-note") as SVGTextElement;
  let started = false;
  let cancel: (() => void) | null = null;
  const start = (): void => {
    if (started) return;
    started = true;
    haptic(HAPTIC.tap);
    fig.classList.add("cold");
    note.textContent = "냉동실 안, 시간이 흐르는 중";
    read.textContent = "? g";
    helper.innerHTML = "냉동실 문을 닫았어요. 밤새 병 안의 물이 꽁꽁 얼어 가요. 병의 모양을 지켜보세요.";
    cancel = tween(fig, 2600, (e) => {
      const d = bodyD(e);
      fills.forEach((p) => p.setAttribute("d", d));
      body.setAttribute("d", d);
      ice.setAttribute("opacity", e.toFixed(2));
      cap.setAttribute("transform", `translate(0 ${(-6 * e).toFixed(1)})`);
      hand.style.transform = `rotate(${(300 * e).toFixed(0)}deg)`;
    }, () => {
      cancel = null;
      fig.classList.add("frozen");
      face("surprised");
      note.textContent = "빵빵하게 부풀고 뚜껑까지 밀려 올라갔어요";
      helper.innerHTML = "병이 <b>빵빵하게 부풀고</b> 뚜껑까지 밀려 올라갔어요. 부피가 커진 거죠. 그럼 저울에 다시 올리면 <b>질량</b>은 어떻게 됐을까요?";
      window.setTimeout(() => {
        ask(choicesBox, helper, {
          choices: s.choices ?? [
            "그대로 500 g",
            "부풀었으니 500 g보다 무거워졌다",
            "얼어서 500 g보다 가벼워졌다",
          ],
          good: "정답! 부풀었어도 병 안의 물 입자는 <b>하나도 늘거나 줄지 않았으니</b> 질량은 그대로예요. 변한 건 부피뿐이죠. 그런데 물은 얼 때 부피가 커지는 <b>특별한</b> 물질이에요. 다른 물질은 어떨지 실험으로 확인해요.",
          bad: "부풀었다고 무거워지거나 가벼워지지 않아요. 병 안의 물 입자는 <b>하나도 늘거나 줄지 않았으니</b> 질량은 그대로 500 g이에요. 변한 건 부피뿐이죠. 물은 얼 때 부피가 커지는 특별한 물질인데, 다른 물질은 어떨지 실험으로 확인해요.",
          onDone: () => {
            read.textContent = "500 g";
            finish();
          },
        });
      }, 800);
    });
  };
  keyTap(fig, start);
  return () => cancel?.();
}

// ═══════════════════════════════════════════════════════════════════
// L5 icewatch — 얼음물 컵에 꽂은 온도계: 얼음이 남아 있는 동안은 0℃에 머물다가, 다 녹으면 오르기 시작한다.
// ═══════════════════════════════════════════════════════════════════
export function renderIceWatch(scene: HTMLElement, helper: HTMLElement, s: HookLike, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hk4-stage hk4-iw", attrs: { role: "button", tabindex: "0", "aria-label": "시간 흐르기" } });
  fig.innerHTML = `
  <svg viewBox="0 0 320 210" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="hk4iwSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF7E6"/><stop offset="1" stop-color="#FFFDF8"/></linearGradient>
      <linearGradient id="hk4iwWater" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#A6DBFF"/><stop offset="0.6" stop-color="#6CBCF2"/><stop offset="1" stop-color="#4A9BDA"/></linearGradient>
      <linearGradient id="hk4iwIce" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="0.6" stop-color="#DDEFFF"/><stop offset="1" stop-color="#B7D9F5"/></linearGradient>
    </defs>
    <rect x="0" y="0" width="320" height="210" fill="url(#hk4iwSky)"/>
    <rect x="200" y="14" width="106" height="90" rx="6" fill="#DCEBFA" stroke="#9DB2C4" stroke-width="2"/>
    <path d="M253 14 v90 M200 59 h106" stroke="#9DB2C4" stroke-width="2"/>
    <circle cx="232" cy="42" r="14" fill="#FFD43B"/>
    <g stroke="#FFD43B" stroke-width="2.4" stroke-linecap="round"><path d="M232 20 v6 M232 58 v6 M210 42 h6 M248 42 h6 M217 27 l4 4 M243 53 l4 4 M247 27 l-4 4 M221 53 l-4 4"/></g>
    <rect x="0" y="164" width="320" height="46" fill="#E9EDF2"/>
    <path d="M0 164 h320" stroke="#C9D3DE" stroke-width="1.4"/>
    <ellipse cx="96" cy="166" rx="44" ry="5" fill="#2A3A5E" opacity="0.10"/>
    <g class="iw-glass">
      <path d="M60 60 l6 102 a10 10 0 0 0 10 8 h40 a10 10 0 0 0 10 -8 l6 -102 Z" fill="url(#hk4iwWater)" opacity="0.7"/>
      <g class="iw-ice iw-ice1"><rect x="72" y="74" width="24" height="22" rx="5" fill="url(#hk4iwIce)" stroke="#8FC1E8" stroke-width="1.6"/><path d="M78 80 l6 -4" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round"/></g>
      <g class="iw-ice iw-ice2"><rect x="100" y="82" width="22" height="20" rx="5" fill="url(#hk4iwIce)" stroke="#8FC1E8" stroke-width="1.6"/><path d="M105 88 l6 -4" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round"/></g>
      <g class="iw-ice iw-ice3"><rect x="84" y="104" width="24" height="20" rx="5" fill="url(#hk4iwIce)" stroke="#8FC1E8" stroke-width="1.6"/><path d="M89 110 l6 -4" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round"/></g>
      <path d="M58 58 l6 104 a12 12 0 0 0 12 10 h40 a12 12 0 0 0 12 -10 l6 -104" fill="none" stroke="#9DB2C4" stroke-width="3" stroke-linejoin="round"/>
      <path d="M52 58 h88" stroke="#9DB2C4" stroke-width="3" stroke-linecap="round"/>
      <path d="M70 76 v70" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" opacity="0.55"/>
    </g>
    <g class="iw-probe">
      <path d="M118 44 v112" stroke="#4E5968" stroke-width="3" stroke-linecap="round"/>
      <circle cx="118" cy="156" r="4" fill="#4E5968"/>
      <rect x="88" y="22" width="60" height="26" rx="8" fill="#FFFFFF" stroke="#4E5968" stroke-width="2.2"/>
      <text class="iw-read" x="118" y="40" text-anchor="middle" font-size="14" font-weight="800" fill="${M3.cold}">0℃</text>
    </g>
    <text class="iw-note" x="160" y="196" text-anchor="middle" font-size="12" font-weight="800" fill="${M3.sub}">탭해서 시간 흐르기 (1/3)</text>
  </svg>`;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "볕이 드는 창가에 <b>얼음이 든 물컵</b>을 두고 온도계를 꽂았어요. 지금은 <b>0℃</b>. 따뜻한 방에서 열이 계속 들어올 텐데, 온도가 어떻게 변할까요? 장면을 <b>탭</b>해 시간을 흘려 보세요.";

  const ices = [1, 2, 3].map((i) => fig.querySelector(`.iw-ice${i}`) as SVGGElement);
  const read = fig.querySelector(".iw-read") as SVGTextElement;
  const note = fig.querySelector(".iw-note") as SVGTextElement;
  let step = 0;
  let timer = 0;
  const tap = (): void => {
    if (step >= 3) return;
    step += 1;
    haptic(HAPTIC.tap);
    const scales = [1, 0.66, 0.36, 0];
    ices.forEach((g, i) => {
      g.style.transform = `scale(${Math.max(0, scales[step] - i * 0.04).toFixed(2)})`;
      if (step >= 3) g.style.opacity = "0";
    });
    if (step === 1) {
      note.textContent = "탭해서 시간 흐르기 (2/3)";
      helper.innerHTML = "얼음이 작아졌는데 온도계는 <b>여전히 0℃</b>예요. 더 흘려 봐요.";
    } else if (step === 2) {
      face("curious");
      note.textContent = "탭해서 시간 흐르기 (3/3)";
      helper.innerHTML = "얼음이 거의 다 녹았는데도 <b>아직 0℃</b>! 열은 계속 들어오고 있는데 이상하죠? 한 번 더.";
    } else {
      note.textContent = "얼음이 다 녹자 온도가 오르기 시작";
      read.textContent = "3℃";
      read.setAttribute("fill", M3.warm);
      timer = window.setTimeout(() => {
        if (!fig.isConnected) return;
        read.textContent = "7℃";
        read.setAttribute("fill", M3.hot);
      }, 900);
      face("surprised");
      helper.innerHTML = "얼음이 다 녹자마자 온도가 <b>오르기 시작</b>했어요. 열은 처음부터 계속 들어오고 있었는데(얼음이 녹고 있었으니까요), 얼음이 남아 있는 동안은 왜 <b>0℃에 머물렀을까요</b>?";
      window.setTimeout(() => {
        ask(choicesBox, helper, {
          choices: s.choices ?? [
            "받은 열에너지가 얼음을 물로 바꾸는 데 모두 쓰여서",
            "얼음이 차가워서 주변의 열이 들어오지 못해서",
            "온도계 끝이 얼음에 닿아 얼음의 온도만 재서",
          ],
          good: "정답! 얼음이 녹는 동안 받은 열에너지는 온도를 올리는 데가 아니라 <b>얼음을 물로 바꾸는 데 모두</b> 쓰여요. 그래서 다 녹을 때까지 온도가 그대로죠. 물이 끓을 때는 어떨까요? 실험으로 확인해요.",
          bad: "열은 계속 들어오고 있었고(얼음이 녹고 있었죠), 온도계는 물속에 잠겨 있었어요. 받은 열에너지가 온도를 올리는 데가 아니라 <b>얼음을 물로 바꾸는 데 모두</b> 쓰여서 온도가 그대로였던 거예요. 물이 끓을 때도 그럴지 실험으로 확인해요.",
          onDone: finish,
        });
      }, 900);
    }
  };
  keyTap(fig, tap);
  return () => window.clearTimeout(timer);
}
