// hookHeat3 — 중1 Ⅲ 「열」 v3 훅 4장면. hook.ts가 scene 이름으로 위임한다.
// 장면: rubhands(L1 손 비비기) · beepthermo(L2 체온계 삐 소리) · hotsand(L4 모래와 바닷물) ·
//       livingwall(L5 스스로 움직이는 건축물). L3은 만화로 열어 훅이 없다.
// 공용 규칙: 예측은 반드시 hookAsk.ask()(choices[0]=정답, good≠bad), 소재명은 도입에서 소개.
// 스타일은 styles/heat3-hook.css(.hk3- 접두). 현행 hook.ts 열 장면(cups·egg·beach·wire)과 이름 무충돌.

import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { H3, thermoSvg } from "../../ui/heat3Kit";
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

/** L1 rubhands — 추운 날 손바닥을 비비면 불도 없이 따뜻해진다. 세 번 비비면 온도계가 오른다. */
export function renderRubHands(scene: HTMLElement, helper: HTMLElement, s: HookLike, finish: () => void, face: Face): void {
  const fig = el("div", { class: "hk3-stage hk3-rh", attrs: { role: "button", tabindex: "0", "aria-label": "손바닥 비비기" } });
  fig.innerHTML = `
  <svg viewBox="0 0 320 210" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <radialGradient id="hk3rhSkin" cx="0.36" cy="0.3" r="1">
        <stop offset="0" stop-color="#FFF1E0"/><stop offset="0.6" stop-color="#FFDDB8"/><stop offset="1" stop-color="#F2C08E"/>
      </radialGradient>
    </defs>
    <ellipse cx="150" cy="196" rx="120" ry="8" fill="#2A3A5E" opacity="0.10"/>
    <g class="rh-cold">
      <path d="M40 30 l6 6 M52 24 l0 8 M64 30 l-6 6" stroke="#74B9F0" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M232 26 l6 6 M244 20 l0 8 M256 26 l-6 6" stroke="#74B9F0" stroke-width="2.4" stroke-linecap="round"/>
    </g>
    <g class="rh-handL">
      <path d="M52 132 c-2 -34 10 -60 40 -62 l6 0 c10 0 18 8 18 18 l0 46 c0 20 -14 30 -32 30 c-18 0 -32 -12 -32 -32 Z" fill="url(#hk3rhSkin)" stroke="#C77B4A" stroke-width="3"/>
      <path d="M70 76 v-24 a7 7 0 0 1 14 0 v24 M88 72 v-30 a7 7 0 0 1 14 0 v30" fill="url(#hk3rhSkin)" stroke="#C77B4A" stroke-width="3"/>
      <path d="M62 100 c6 -8 16 -12 26 -12" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" opacity="0.6"/>
    </g>
    <g class="rh-handR">
      <path d="M240 96 c2 34 -10 60 -40 62 l-6 0 c-10 0 -18 -8 -18 -18 l0 -46 c0 -20 14 -30 32 -30 c18 0 32 12 32 32 Z" fill="url(#hk3rhSkin)" stroke="#C77B4A" stroke-width="3"/>
      <path d="M222 152 v24 a7 7 0 0 1 -14 0 v-24 M204 156 v30 a7 7 0 0 1 -14 0 v-30" fill="url(#hk3rhSkin)" stroke="#C77B4A" stroke-width="3"/>
    </g>
    <g class="rh-lines">
      <path d="M128 92 q6 -8 12 0 M128 110 q6 -8 12 0 M128 128 q6 -8 12 0" stroke="${H3.hot}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <path d="M160 96 q6 -8 12 0 M160 114 q6 -8 12 0" stroke="${H3.warm}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    </g>
    ${thermoSvg(276, 30, 110, "hk3rh")}
    <text class="rh-read" x="283" y="200" text-anchor="middle" font-size="12" font-weight="800" fill="${H3.sub}">31℃</text>
  </svg>`;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "추운 겨울 아침이에요. 손이 시릴 때 우리는 <b>손바닥을 비비죠</b>. 장면을 <b>세 번 탭</b>해서 손을 비벼 보세요. 옆의 온도계를 지켜보고요.";

  let rubs = 0;
  const reads = ["31℃", "33℃", "35℃", "36℃"];
  const merc = fig.querySelector(".hk3rh-merc") as SVGRectElement;
  const read = fig.querySelector(".rh-read") as SVGTextElement;
  const rub = (): void => {
    if (rubs >= 3) return;
    rubs += 1;
    haptic(HAPTIC.tap);
    fig.classList.remove("rubbing");
    void fig.offsetWidth;
    fig.classList.add("rubbing");
    if (rubs >= 2) fig.classList.add("warm");
    merc.style.transform = `scaleY(${0.3 + rubs * 0.15})`;
    read.textContent = reads[rubs];
    if (rubs === 1) helper.innerHTML = "쓱쓱. 손바닥이 조금 따뜻해졌어요. 두 번 더!";
    if (rubs === 2) {
      face("curious");
      helper.innerHTML = "온도계 눈금이 오르네요? 한 번 더 비벼 봐요.";
    }
    if (rubs === 3) {
      face("surprised");
      helper.innerHTML = "불도 없고 난로도 없는데 손이 뜨끈해졌어요. 손이 따뜻해진 <b>진짜 까닭</b>은 무엇일까요?";
      window.setTimeout(() => {
        ask(choicesBox, helper, {
          choices: s.choices ?? [
            "손을 이루는 입자들의 움직임이 활발해져서",
            "손바닥 사이에서 작은 불이 붙어서",
            "주변 공기가 손으로 몰려와서",
          ],
          good: "정답! 비비는 동안 손을 이루는 <b>입자들이 더 활발하게 흔들렸고</b>, 그게 바로 온도가 오른 거예요. 온도의 정체가 입자의 움직임이라는 것, 오늘의 주제랍니다.",
          bad: "불이 붙은 것도, 공기가 몰린 것도 아니에요. 비비는 동안 손을 이루는 <b>입자들이 더 활발하게 흔들렸고</b>, 그래서 온도가 올랐어요. 온도의 정체가 입자의 움직임이라는 것, 오늘의 주제예요.",
          onDone: finish,
        });
      }, 800);
    }
  };
  keyTap(fig, rub);
}

/** L2 beepthermo — 체온계는 왜 삐 소리가 날 때까지 기다려야 할까. 탭하면 눈금이 오르다 멈춘다. */
export function renderBeepThermo(scene: HTMLElement, helper: HTMLElement, s: HookLike, finish: () => void, face: Face): void {
  const fig = el("div", { class: "hk3-stage hk3-bt", attrs: { role: "button", tabindex: "0", "aria-label": "체온 재기 시작" } });
  fig.innerHTML = `
  <svg viewBox="0 0 320 210" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="hk3btBody" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E9EDF2"/>
      </linearGradient>
    </defs>
    <ellipse cx="160" cy="198" rx="120" ry="8" fill="#2A3A5E" opacity="0.10"/>
    <g class="bt-person">
      <circle cx="82" cy="60" r="22" fill="#FFFFFF" stroke="${H3.ink}" stroke-width="3"/>
      <circle cx="74" cy="58" r="2.2" fill="${H3.ink}"/><circle cx="90" cy="58" r="2.2" fill="${H3.ink}"/>
      <path d="M74 70 q8 6 16 0" stroke="${H3.ink}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <path d="M82 82 v70 M82 100 l-30 26 M82 100 l24 8 M82 152 l-18 40 M82 152 l18 40" stroke="${H3.ink}" stroke-width="3" stroke-linecap="round" fill="none"/>
      <rect x="100" y="98" width="30" height="10" rx="5" fill="#FFFFFF" stroke="#8B95A1" stroke-width="2.4" transform="rotate(-20 100 98)"/>
    </g>
    <g class="bt-device">
      <rect x="176" y="34" width="118" height="140" rx="20" fill="url(#hk3btBody)" stroke="#8B95A1" stroke-width="3"/>
      <rect x="192" y="52" width="86" height="46" rx="10" fill="#E6FCF5" stroke="#A9D9C6" stroke-width="2"/>
      <text class="bt-read" x="235" y="84" text-anchor="middle" font-size="26" font-weight="800" fill="#0A8F4E">- -.-</text>
      <circle cx="235" cy="134" r="16" fill="#FFFFFF" stroke="#8B95A1" stroke-width="2.6"/>
      <circle cx="235" cy="134" r="6" fill="${H3.heat}"/>
      <g class="bt-beep">
        <path d="M300 60 q8 10 0 20 M308 50 q14 20 0 40" stroke="${H3.ok}" stroke-width="3" fill="none" stroke-linecap="round"/>
      </g>
    </g>
    <text class="bt-note" x="235" y="196" text-anchor="middle" font-size="12" font-weight="800" fill="${H3.sub}">탭해서 재기 시작</text>
  </svg>`;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "열이 나는지 <b>체온계</b>로 재 볼게요. 겨드랑이에 끼우고 나면 <b>삐 소리가 날 때까지</b> 한참을 기다려야 하죠. 장면을 <b>탭</b>해서 재기 시작!";

  let started = false;
  const read = fig.querySelector(".bt-read") as SVGTextElement;
  const note = fig.querySelector(".bt-note") as SVGTextElement;
  const seq = ["34.6", "35.4", "36.0", "36.3", "36.5", "36.5"];
  const start = (): void => {
    if (started) return;
    started = true;
    haptic(HAPTIC.tap);
    fig.classList.add("measuring");
    note.textContent = "재는 중…";
    helper.innerHTML = "눈금이 오르고 있어요. 언제까지 오를까요?";
    seq.forEach((v, i) => {
      window.setTimeout(() => {
        read.textContent = v;
        if (i === seq.length - 1) {
          fig.classList.add("beep");
          note.textContent = "삐!";
          face("surprised");
          helper.innerHTML = "삐! 눈금이 <b>36.5</b>에서 더 오르지 않자 소리가 났어요. 이 소리는 무엇을 알려 주는 걸까요?";
          window.setTimeout(() => {
            ask(choicesBox, helper, {
              choices: s.choices ?? [
                "온도계와 몸의 온도가 같아졌다",
                "온도계가 몸보다 더 뜨거워졌다",
                "정해진 시간이 다 지났을 뿐이다",
              ],
              good: "정답! 몸에서 온도계로 열이 옮겨 가다가, <b>둘의 온도가 같아지면</b> 눈금이 멈춰요. 그때가 진짜 체온이죠. 이 상태에 이름이 있는데, 실험으로 직접 확인해 봐요.",
              bad: "온도계는 몸보다 뜨거워질 수 없고, 시계도 아니에요. 몸에서 온도계로 열이 옮겨 가다가 <b>둘의 온도가 같아지면</b> 눈금이 멈추고, 그때가 진짜 체온이에요. 이 상태의 이름을 실험으로 확인해 봐요.",
              onDone: finish,
            });
          }, 700);
        }
      }, 450 + i * 520);
    });
  };
  keyTap(fig, start);
}

/** L4 hotsand — 같은 햇볕 아래 모래는 뜨겁고 바닷물은 시원하다. 둘을 탭해 온도를 재 본다. */
export function renderHotSand(scene: HTMLElement, helper: HTMLElement, s: HookLike, finish: () => void, face: Face): void {
  const fig = el("div", { class: "hk3-stage hk3-hs" });
  fig.innerHTML = `
  <svg viewBox="0 0 320 210" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="hk3hsSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#CDE8FF"/><stop offset="1" stop-color="#F3FAFF"/>
      </linearGradient>
      <linearGradient id="hk3hsSea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#63C3F0"/><stop offset="1" stop-color="#2B9BD6"/>
      </linearGradient>
      <radialGradient id="hk3hsSand" cx="0.4" cy="0.2" r="1">
        <stop offset="0" stop-color="#FFF0C2"/><stop offset="1" stop-color="#E8C98A"/>
      </radialGradient>
    </defs>
    <rect x="0" y="0" width="320" height="210" fill="url(#hk3hsSky)"/>
    <circle cx="262" cy="42" r="20" fill="#FFD43B"/>
    <g stroke="#FFD43B" stroke-width="3" stroke-linecap="round">
      <path d="M262 8 v10 M262 66 v10 M228 42 h10 M286 42 h10 M238 18 l7 7 M279 59 l7 7 M286 18 l-7 7 M245 59 l-7 7"/>
    </g>
    <path class="hs-sea" d="M160 120 q40 -10 80 0 t80 0 v90 h-160 Z" fill="url(#hk3hsSea)"/>
    <path d="M172 136 q12 -6 24 0 M214 150 q12 -6 24 0 M256 140 q12 -6 24 0" stroke="#FFFFFF" stroke-width="2.4" fill="none" stroke-linecap="round" opacity="0.75"/>
    <path class="hs-sand" d="M0 150 c40 -40 100 -50 172 -22 v82 h-172 Z" fill="url(#hk3hsSand)"/>
    <g fill="#C9A86A" opacity="0.7">${[[30, 170], [60, 190], [90, 160], [120, 185], [150, 170], [40, 200], [110, 200]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.8"/>`).join("")}</g>
    <g class="hs-tag hs-tag-sand"><rect x="44" y="96" width="76" height="30" rx="9" fill="#FFFFFF" stroke="${H3.hot}" stroke-width="2.4"/><text x="82" y="116" text-anchor="middle" font-size="13" font-weight="800" fill="${H3.hot}">모래 46℃</text></g>
    <g class="hs-tag hs-tag-sea"><rect x="196" y="72" width="88" height="30" rx="9" fill="#FFFFFF" stroke="${H3.cold}" stroke-width="2.4"/><text x="240" y="92" text-anchor="middle" font-size="13" font-weight="800" fill="${H3.cold}">바닷물 24℃</text></g>
    <rect class="hs-hit hs-hit-sand" x="0" y="120" width="160" height="90" fill="transparent"/>
    <rect class="hs-hit hs-hit-sea" x="160" y="110" width="160" height="100" fill="transparent"/>
  </svg>`;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "한여름 <b>해변</b>이에요. 같은 햇볕을 하루 종일 받은 <b>모래</b>와 <b>바닷물</b>, 온도계를 꽂아 볼까요? 모래와 바다를 각각 <b>탭</b>하세요.";

  const done = new Set<string>();
  const hit = (which: "sand" | "sea"): void => {
    if (done.has(which)) return;
    done.add(which);
    haptic(HAPTIC.tap);
    fig.classList.add(`on-${which}`);
    if (done.size === 1) {
      helper.innerHTML = which === "sand"
        ? "모래는 <b>46℃</b>! 발을 못 디딜 정도예요. 이번엔 바닷물도 재 보세요."
        : "바닷물은 <b>24℃</b>, 시원하네요. 이번엔 모래도 재 보세요.";
      face("curious");
      return;
    }
    face("surprised");
    helper.innerHTML = "모래 46℃, 바닷물 24℃. <b>같은 햇볕</b>을 똑같이 받았는데 왜 이렇게 다를까요?";
    window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "물은 모래보다 온도가 잘 변하지 않는 물질이라서",
          "바닷물이 햇빛을 훨씬 덜 받아서",
          "모래가 태양과 더 가까이 있어서",
        ],
        good: "정답! 같은 열을 받아도 <b>물은 모래보다 온도가 훨씬 천천히</b> 올라요. 물질마다 다른 이 성질에 이름이 있어요. 오늘 실험으로 확인해요.",
        bad: "햇빛의 양도, 태양과의 거리도 같아요. 차이는 물질 자체에 있어요. <b>물은 모래보다 온도가 잘 변하지 않는</b> 성질이 있거든요. 그 성질의 이름을 오늘 실험으로 확인해요.",
        onDone: finish,
      });
    }, 700);
  };
  const hitSand = fig.querySelector(".hs-hit-sand") as SVGRectElement;
  const hitSea = fig.querySelector(".hs-hit-sea") as SVGRectElement;
  hitSand.addEventListener("click", () => hit("sand"));
  hitSea.addEventListener("click", () => hit("sea"));
  const btnRow = el("div", { class: "hk3-btnrow" });
  const bSand = el("button", { class: "hk3-btn", text: "모래 재기", attrs: { type: "button" } });
  const bSea = el("button", { class: "hk3-btn", text: "바닷물 재기", attrs: { type: "button" } });
  bSand.addEventListener("click", () => hit("sand"));
  bSea.addEventListener("click", () => hit("sea"));
  btnRow.append(bSand, bSea);
  fig.appendChild(btnRow);
}

/** L5 livingwall — 두 금속을 붙인 조각으로 만든 건축물이 햇볕에 곡선으로 휘고 그늘에서 펴진다.
 *  사용자 피드백(2026-09-03): 통째로 기우는 게 아니라 바이메탈답게 곡선으로 휘어야 한다 → 경로 d 보간. */
export function renderLivingWall(scene: HTMLElement, helper: HTMLElement, s: HookLike, finish: () => void, face: Face): void {
  const fig = el("div", { class: "hk3-stage hk3-lw", attrs: { role: "button", tabindex: "0", "aria-label": "햇볕 비추기" } });
  const TOP = 44, LEN = 108, HALF = 5.5;
  const xs = [62, 108, 154, 200, 246];
  // 휨 정도 k(0~1): 위 끝 고정, 아래 끝이 오른쪽(열팽창 정도가 작은 금속 쪽)으로 곡선을 그리며 들린다.
  const stripD = (cx: number, k: number, off: number): string => {
    const x0 = cx + off;
    const qx = x0 + 6 * k, qy = TOP + LEN * 0.62;
    const ex = x0 + 26 * k, ey = TOP + LEN - 8 * k;
    return `M${x0} ${TOP} Q${qx.toFixed(1)} ${qy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`;
  };
  const strips = xs.map((cx, i) => `<g class="lw-strip" data-i="${i}">
      <path class="lw-a" d="${stripD(cx, 0, -HALF)}" stroke="#F5B301" stroke-width="11" fill="none"/>
      <path class="lw-b" d="${stripD(cx, 0, HALF)}" stroke="#C3CBD4" stroke-width="11" fill="none"/>
    </g>`).join("");
  fig.innerHTML = `
  <svg viewBox="0 0 320 210" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="hk3lwSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#DCEBFA"/><stop offset="1" stop-color="#F8FBFF"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="320" height="210" fill="url(#hk3lwSky)"/>
    <g class="lw-sun"><circle cx="280" cy="30" r="16" fill="#FFD43B"/><g stroke="#FFD43B" stroke-width="3" stroke-linecap="round"><path d="M280 4 v6 M280 50 v6 M254 30 h6 M300 30 h6 M262 12 l4 4 M294 44 l4 4 M298 12 l-4 4 M266 44 l-4 4"/></g></g>
    <g class="lw-cloud"><path d="M246 36 a14 14 0 0 1 26 -6 a12 12 0 0 1 22 8 a10 10 0 0 1 -6 18 h-42 a10 10 0 0 1 0 -20 Z" fill="#FFFFFF" stroke="#B9C2CC" stroke-width="2"/></g>
    <rect x="34" y="36" width="252" height="126" rx="6" fill="#5C6B7A" stroke="#4E5968" stroke-width="2.4"/>
    <rect x="34" y="36" width="252" height="8" fill="#39445B"/>
    ${strips}
    <rect x="0" y="162" width="320" height="48" fill="#C9D3DE"/>
    <text class="lw-note" x="160" y="190" text-anchor="middle" font-size="12" font-weight="800" fill="${H3.sub}">탭해서 햇볕 비추기</text>
  </svg>`;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "이 건물의 벽은 <b>두 종류의 금속을 붙여 만든 조각</b>들이에요. 그런데 이 벽, <b>스스로 움직인다</b>고 하네요? 장면을 <b>탭</b>해서 햇볕을 비춰 보세요.";

  let sunny = false;
  let asked = false;
  let bend = 0;
  let tweenId = 0;
  const note = fig.querySelector(".lw-note") as SVGTextElement;
  const paths = xs.map((cx, i) => ({
    cx,
    a: fig.querySelector(`.lw-strip[data-i="${i}"] .lw-a`) as SVGPathElement,
    b: fig.querySelector(`.lw-strip[data-i="${i}"] .lw-b`) as SVGPathElement,
  }));
  const tween = (to: number): void => {
    const from = bend;
    const steps = 18;
    let n = 0;
    const id = ++tweenId;
    const stepFn = (): void => {
      if (id !== tweenId || !fig.isConnected) return;
      n += 1;
      const t = n / steps;
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      bend = from + (to - from) * e;
      for (const p of paths) {
        p.a.setAttribute("d", stripD(p.cx, bend, -HALF));
        p.b.setAttribute("d", stripD(p.cx, bend, HALF));
      }
      if (n < steps) window.setTimeout(stepFn, 40);
    };
    stepFn();
  };
  const toggle = (): void => {
    sunny = !sunny;
    haptic(HAPTIC.tap);
    fig.classList.toggle("sunny", sunny);
    note.textContent = sunny ? "햇볕이 쨍쨍, 조각이 휘어져 틈이 벌어져요" : "그늘이 지자 조각이 펴져요";
    tween(sunny ? 1 : 0);
    if (sunny && !asked) {
      asked = true;
      face("surprised");
      helper.innerHTML = "햇볕이 닿자 조각들이 <b>곡선으로 휘어지면서 틈이 벌어졌어요</b>. 아무도 건드리지 않았는데, 왜 휘어졌을까요?";
      window.setTimeout(() => {
        ask(choicesBox, helper, {
          choices: s.choices ?? [
            "금속이 열을 받아 늘어나기 때문에",
            "바람이 조각을 밀어서",
            "조각 속에 작은 모터가 들어 있어서",
          ],
          good: "정답! 금속은 열을 받으면 늘어나요. 그런데 늘어나기만 하면 될 텐데 왜 '휘어질까요'? <b>두 금속을 붙였기</b> 때문인데, 그 비밀은 실험으로 확인해요. 한 번 더 탭하면 그늘이 져요.",
          bad: "바람도 모터도 아니에요. <b>금속이 열을 받으면 늘어나는</b> 성질 때문이에요. 그런데 왜 늘어나기만 하지 않고 휘어질까요? 두 금속을 붙인 비밀은 실험에서 확인해요. 한 번 더 탭하면 그늘이 져요.",
          onDone: finish,
        });
      }, 900);
    }
  };
  keyTap(fig, toggle);
}
