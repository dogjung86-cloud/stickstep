// hookAnimal2 — 중2 Ⅵ 동물과 에너지 훅 뒤쪽 6장면(L7~L12).
// hookAnimal.ts의 디스패처(animalHook)가 registerAnimalScenes로 이 장면들을 흡수한다.
// 장면 계약·SVG 문법은 hookAnimal.ts 머리말과 동일.

import { haptic, HAPTIC } from "../../core/haptics";
import { SUBSTANCE, TISSUE, VESSEL } from "../../ui/animalKit";
import { ask } from "./hookAsk";
import {
  SH, wrapSvg, lg3, rg3, mount, once, later, every,
  registerAnimalScenes, type AnimalSceneFn,
} from "./hookAnimal";

const q = <T extends Element>(fig: HTMLElement, sel: string): T => fig.querySelector(sel) as T;
const show = (fig: HTMLElement, sel: string, v = "1"): void => {
  const node = fig.querySelector<SVGElement>(sel);
  if (node) node.style.opacity = v;
};

/* ── 7. spintube — 혈액을 원심분리기에 돌리면 (L7 혈액) ──────────────── */
export const renderSpintube: AnimalSceneFn = (scene, helper, finish, face, choices) => {
  const { fig, btn, box } = mount(
    scene,
    wrapSvg(
      `<rect x="8" y="10" width="344" height="180" rx="16" fill="url(#st-bg)"/>
      ${SH(180, 176, 96, 0.13)}
      <rect x="112" y="150" width="136" height="22" rx="8" fill="url(#st-rack)" stroke="#8B6A46" stroke-width="1.6"/>
      <g class="st-spin" style="transform-origin:180px 96px;transition:transform 1.4s cubic-bezier(.4,0,.2,1)">
        <path d="M164 34 h32 v106 a16 16 0 0 1 -32 0 Z" fill="url(#st-glass)" stroke="#9AB2C4" stroke-width="1.8"/>
        <rect x="163" y="30" width="34" height="8" rx="4" fill="#DCE6EF" stroke="#9AB2C4" stroke-width="1.2"/>
        <path class="st-whole" d="M166 56 h28 v84 a14 14 0 0 1 -28 0 Z" fill="url(#st-blood)" style="opacity:1;transition:opacity .6s"/>
        <g class="st-split" style="opacity:0;transition:opacity .6s">
          <path d="M166 56 h28 v46 h-28 Z" fill="url(#st-plasma)"/>
          <path d="M166 102 h28 v38 a14 14 0 0 1 -28 0 Z" fill="url(#st-cells)"/>
          <path d="M166 102 h28" stroke="#FFFFFF" stroke-width="1.6" opacity=".7"/>
        </g>
      </g>
      <g class="st-tags" style="opacity:0;transition:opacity .5s">
        <path d="M200 78 h44" stroke="#8A97A6" stroke-width="1.4"/>
        <path d="M200 122 h44" stroke="#8A97A6" stroke-width="1.4"/>
        <text x="248" y="82" font-size="12" font-weight="900" fill="#B57A1E">노란 액체</text>
        <text x="248" y="126" font-size="12" font-weight="900" fill="${VESSEL.rich.lo}">붉은 덩어리</text>
      </g>
      <text x="180" y="24" text-anchor="middle" font-size="12.5" font-weight="900" fill="#5C6E80">뽑아 둔 혈액</text>`,
      `${lg3("st-bg", "#FFF8F8", "#FBEEF0", "#F2E2E6")}
      ${lg3("st-glass", "#FFFFFF", "#F2F7FB", "#DCE7F0")}
      ${lg3("st-rack", "#E2C79E", "#C9A876", "#9A7A48")}
      ${lg3("st-blood", "#D8404F", "#B32637", "#7A1725")}
      ${lg3("st-plasma", "#FFEFC0", "#F2D06A", "#B58F1E")}
      ${lg3("st-cells", "#C43142", "#9E1E30", "#6B1220")}`,
    ),
    "원심분리기에 넣고 빠르게 돌리기",
  );
  helper.innerHTML = "병원에서 뽑은 <b>혈액</b>이에요. 통째로 보면 그냥 붉은 액체 같죠? 아주 빠르게 돌리는 기계인 <b>원심분리기</b>에 넣어 볼게요.";

  once(btn, () => {
    const spin = q<SVGGElement>(fig, ".st-spin");
    spin.style.transform = "rotate(1080deg)";
    later(() => {
      show(fig, ".st-whole", "0");
      show(fig, ".st-split");
      haptic(HAPTIC.select);
      later(() => {
        show(fig, ".st-tags");
        face("surprised");
        helper.innerHTML = "붉은 액체가 <b>두 층</b>으로 갈라졌어요! 위쪽은 맑은 <b>노란 액체</b>, 아래쪽은 진한 <b>붉은 덩어리</b>예요.";
        later(() => {
          ask(box, helper, {
            choices: choices ?? [
              "위쪽은 액체 성분, 아래쪽은 가라앉은 세포 성분이에요",
              "위쪽은 혈액이 상해서 생긴 물이에요",
              "위쪽은 산소가 빠져나가 색이 하얘진 혈액이에요",
            ],
            good: "정확해요! 혈액은 <b>액체 성분</b>과 <b>세포 성분</b>이 섞인 것이라, 빠르게 돌리면 무거운 세포가 아래로 가라앉아요. 두 성분이 각각 무슨 일을 하는지 이번 레슨에서 만나 봐요!",
            bad: "상하거나 색이 변한 게 아니에요. 혈액은 처음부터 <b>액체 성분과 세포 성분이 섞인 것</b>이고, 빠르게 돌리면 무거운 세포가 아래로 가라앉아 갈라져 보이는 거예요. 두 성분의 정체, 이번 레슨에서 밝혀요!",
            onDone: finish,
          });
        }, 950);
      }, 700);
    }, 1500);
  });
};

/* ── 8. twoloop — 적혈구를 따라 한 바퀴 (L8 혈액의 순환 경로) ────────── */
export const renderTwoloop: AnimalSceneFn = (scene, helper, finish, face, choices) => {
  const { fig, btn, box } = mount(
    scene,
    wrapSvg(
      `<rect x="8" y="10" width="344" height="180" rx="16" fill="url(#tl-bg)"/>
      <g opacity=".45">
        <ellipse cx="120" cy="58" rx="42" ry="30" fill="url(#tl-lung)"/>
        <ellipse cx="240" cy="58" rx="42" ry="30" fill="url(#tl-lung)"/>
        <text x="180" y="30" text-anchor="middle" font-size="11.5" font-weight="900" fill="#8A6E7A">허파</text>
      </g>
      <path d="M180 108 C 96 108 62 132 62 150 C 62 170 120 176 180 176 C 240 176 298 170 298 150 C 298 132 264 108 180 108"
            stroke="url(#tl-body)" stroke-width="11" fill="none" stroke-linecap="round"/>
      <text x="180" y="196" text-anchor="middle" font-size="11.5" font-weight="900" fill="#5C6E80">온몸</text>
      <g transform="translate(180 100)">
        <path d="M-20 -6 q0 -18 12 -18 q8 0 8 9 q0 -9 8 -9 q12 0 12 18 q0 18 -20 30 q-20 -12 -20 -30 Z" fill="url(#tl-heart)" stroke="${TISSUE.heart.lo}" stroke-width="1.8"/>
      </g>
      <g class="tl-dot" style="transition:transform 1.1s cubic-bezier(.42,0,.58,1)">
        <circle cx="180" cy="110" r="8" fill="url(#tl-rbc)" stroke="#7C1E2B" stroke-width="1.4"/>
      </g>`,
      `${lg3("tl-bg", "#FDF7F8", "#F8EDF1", "#EFE1E8")}
      ${lg3("tl-lung", TISSUE.lung.hi, TISSUE.lung.mid, TISSUE.lung.lo)}
      ${lg3("tl-body", VESSEL.rich.hi, VESSEL.rich.mid, VESSEL.rich.lo)}
      ${rg3("tl-heart", TISSUE.heart.hi, TISSUE.heart.mid, TISSUE.heart.lo)}
      ${rg3("tl-rbc", "#F06070", "#C43142", "#7C1E2B")}`,
    ),
    "적혈구 한 개를 따라가 보기",
  );
  helper.innerHTML = "가운데가 <b>심장</b>, 아래 큰 고리가 <b>온몸</b>, 위 두 덩이가 <b>허파</b>예요. 적혈구 한 개가 심장에서 출발하면 어디를 거쳐 돌아올까요?";

  once(btn, () => {
    const dot = q<SVGGElement>(fig, ".tl-dot");
    const path: [number, number][] = [[-118, 42], [-118, 72], [0, 76], [118, 72], [118, 42], [0, 0]];
    path.forEach(([dx, dy], i) => {
      later(() => {
        dot.style.transform = `translate(${dx}px, ${dy}px)`;
      }, 120 + i * 700);
    });
    later(() => {
      face("curious");
      helper.innerHTML = "온몸을 한 바퀴 돌고 <b>심장으로 돌아왔어요</b>. 그런데 이 적혈구는 온몸에 산소를 나눠 주고 온 참이라 <b>산소가 텅 비었어요</b>.";
      later(() => {
        ask(box, helper, {
          choices: choices ?? [
            "다시 나가기 전에 허파에 들러 산소를 채워 와야 해요",
            "심장이 산소를 만들어 채워 주니까 바로 다시 나가요",
            "산소가 없어도 괜찮아서 그냥 온몸으로 다시 나가요",
          ],
          good: "맞아요! 그래서 우리 몸의 혈액은 <b>두 바퀴</b>를 돌아요. 온몸을 도는 바퀴, 그리고 허파에 들르는 바퀴. 이번 레슨에서 두 경로를 직접 이어 봐요!",
          bad: "심장은 <b>펌프</b>일 뿐 산소를 만들지 못해요. 산소는 오직 <b>허파</b>에서만 받을 수 있죠. 그래서 혈액은 온몸 바퀴와 허파 바퀴, <b>두 바퀴</b>를 번갈아 돈답니다!",
          onDone: finish,
        });
      }, 950);
    }, 120 + path.length * 700);
  });
};

/* ── 9. holdbreath — 크게 숨을 들이쉬면 무엇이 움직일까 (L9 호흡운동) ── */
export const renderHoldbreath: AnimalSceneFn = (scene, helper, finish, face, choices) => {
  const rib = (y: number, w: number, cls: string): string =>
    `<path class="${cls}" d="M${180 - w} ${y} q${w} ${-14} ${w * 2} 0" stroke="url(#hb-bone)" stroke-width="7" stroke-linecap="round" fill="none" style="transition:transform .8s var(--ease)"/>`;
  const { fig, btn, box } = mount(
    scene,
    wrapSvg(
      `<rect x="8" y="10" width="344" height="180" rx="16" fill="url(#hb-bg)"/>
      <path d="M104 40 q76 -18 152 0 q10 62 -6 116 q-70 14 -140 0 q-16 -54 -6 -116 Z" fill="url(#hb-body)" opacity=".55"/>
      <g class="hb-lungs" style="transform-origin:180px 92px;transition:transform .8s var(--ease)">
        <ellipse cx="146" cy="92" rx="30" ry="40" fill="url(#hb-lung)" stroke="${TISSUE.lung.lo}" stroke-width="1.6"/>
        <ellipse cx="214" cy="92" rx="30" ry="40" fill="url(#hb-lung)" stroke="${TISSUE.lung.lo}" stroke-width="1.6"/>
        <path d="M180 34 v26 M180 60 q-16 6 -22 14 M180 60 q16 6 22 14" stroke="url(#hb-air)" stroke-width="7" stroke-linecap="round" fill="none"/>
      </g>
      ${rib(70, 52, "hb-rib")}${rib(92, 58, "hb-rib")}${rib(114, 54, "hb-rib")}
      <path class="hb-dia" d="M112 150 q68 22 136 0" stroke="url(#hb-dia)" stroke-width="9" stroke-linecap="round" fill="none" style="transition:d .8s var(--ease),transform .8s var(--ease)"/>
      <text x="286" y="154" font-size="11" font-weight="900" fill="#4A7286">가로막</text>
      <text x="286" y="72" font-size="11" font-weight="900" fill="#8C8272">갈비뼈</text>
      <g class="hb-in" style="opacity:0;transition:opacity .5s">
        <path d="M180 20 v-10 M168 26 l-8 -8 M192 26 l8 -8" stroke="#3182F6" stroke-width="3" stroke-linecap="round"/>
      </g>`,
      `${lg3("hb-bg", "#F7FAFD", "#EEF4F9", "#E1EBF3")}
      ${lg3("hb-body", "#FBE6DA", "#F0CDB8", "#D8AC92")}
      ${lg3("hb-lung", TISSUE.lung.hi, TISSUE.lung.mid, TISSUE.lung.lo)}
      ${lg3("hb-bone", TISSUE.bone.hi, TISSUE.bone.mid, TISSUE.bone.lo)}
      ${lg3("hb-dia", TISSUE.membrane.hi, TISSUE.membrane.mid, TISSUE.membrane.lo)}
      ${lg3("hb-air", VESSEL.airway.hi, VESSEL.airway.mid, VESSEL.airway.lo)}`,
    ),
    "가슴에 손을 얹고 숨 크게 들이쉬기",
  );
  helper.innerHTML = "가슴에 손을 얹고 숨을 <b>크게</b> 들이쉬어 보세요. 가슴이 부풀어 오르는 게 느껴지죠? 몸 안에서는 무슨 일이 벌어질까요?";

  once(btn, () => {
    fig.querySelectorAll<SVGPathElement>(".hb-rib").forEach((r) => { r.style.transform = "translateY(-9px)"; });
    q<SVGPathElement>(fig, ".hb-dia").style.transform = "translateY(13px)";
    q<SVGGElement>(fig, ".hb-lungs").style.transform = "scale(1.16)";
    show(fig, ".hb-in");
    later(() => {
      face("curious");
      helper.innerHTML = "갈비뼈는 <b>위로</b>, 가로막은 <b>아래로</b> 움직이고 허파가 커졌어요. 그런데 잠깐, 허파가 스스로 부푼 걸까요?";
      later(() => {
        ask(box, helper, {
          choices: choices ?? [
            "허파에는 근육이 없어요, 갈비뼈와 가로막이 대신 움직여 준 거예요",
            "허파가 근육을 써서 스스로 크게 부풀어요",
            "들어온 공기가 허파를 밀어서 억지로 부풀린 거예요",
          ],
          good: "정확해요! 허파는 <b>근육이 없어 스스로 움직이지 못해요</b>. 갈비뼈와 가로막이 흉강을 넓혀 주면 그때 공기가 따라 들어오죠. 이번 레슨에서 그 원리를 모형으로 직접 움직여 봐요!",
          bad: "허파에는 <b>근육이 없어요</b>. 스스로 부풀 수도, 공기에 억지로 밀릴 수도 없죠. 실제로는 갈비뼈와 가로막이 먼저 움직여 <b>공간을 넓혀 주고</b>, 그다음에 공기가 들어오는 순서랍니다!",
          onDone: finish,
        });
      }, 1000);
    }, 950);
  });
};

/* ── 10. windowair — 닫힌 교실의 공기 (L10 기체 교환) ────────────────── */
export const renderWindowair: AnimalSceneFn = (scene, helper, finish, face, choices) => {
  const head = (x: number, y: number): string =>
    `<g><circle cx="${x}" cy="${y}" r="8" fill="url(#wa-head)" stroke="#B07A56" stroke-width="1.3"/>
      <path d="M${x} ${y + 9} v13 M${x - 8} ${y + 14} h16" stroke="#5C6E80" stroke-width="2.4" stroke-linecap="round"/></g>`;
  const { fig, btn, box } = mount(
    scene,
    wrapSvg(
      `<rect x="8" y="10" width="344" height="180" rx="16" fill="url(#wa-bg)"/>
      <rect x="26" y="30" width="220" height="140" rx="10" fill="url(#wa-room)" stroke="#B4C2D2" stroke-width="1.6"/>
      ${[0, 1, 2, 3].map((i) => head(58 + i * 46, 92)).join("")}
      ${[0, 1, 2].map((i) => head(80 + i * 46, 134)).join("")}
      <g class="wa-win" style="transform-origin:246px 100px;transition:transform .8s var(--ease)">
        <rect x="240" y="56" width="14" height="88" rx="4" fill="url(#wa-glass)" stroke="#8FA8BC" stroke-width="1.6"/>
      </g>
      <rect x="266" y="46" width="76" height="108" rx="12" fill="#FFFFFF" stroke="#C6D2DE" stroke-width="1.6"/>
      <text x="304" y="68" text-anchor="middle" font-size="10.5" font-weight="900" fill="#8A97A6">이산화 탄소</text>
      <text class="wa-num" x="304" y="98" text-anchor="middle" font-size="19" font-weight="900" fill="${SUBSTANCE.carbon.lo}">2400</text>
      <text x="304" y="116" text-anchor="middle" font-size="10" font-weight="800" fill="#8A97A6">ppm</text>
      <rect class="wa-bar" x="278" y="128" width="52" height="12" rx="6" fill="${SUBSTANCE.carbon.mid}" style="transition:width .9s var(--ease)"/>
      <rect x="278" y="128" width="52" height="12" rx="6" fill="none" stroke="#C6D2DE" stroke-width="1.2"/>`,
      `${lg3("wa-bg", "#F7FAFD", "#EDF3F9", "#DFEAF3")}
      ${lg3("wa-room", "#FFFFFF", "#F4F8FC", "#E4EDF5")}
      ${lg3("wa-glass", "#EAF6FC", "#CDE6F2", "#9FC2D4")}
      ${rg3("wa-head", "#F7D9C2", "#E5B48F", "#B07A56")}`,
    ),
    "창문 활짝 열기",
  );
  helper.innerHTML = "창문을 꼭 닫은 교실이에요. 40분쯤 지나자 공기 측정기의 <b>이산화 탄소</b> 수치가 2400까지 올라갔어요. 창문을 열어 볼까요?";

  once(btn, () => {
    q<SVGGElement>(fig, ".wa-win").style.transform = "rotate(-38deg)";
    const num = q<SVGTextElement>(fig, ".wa-num");
    q<SVGRectElement>(fig, ".wa-bar").setAttribute("width", "14");
    let v = 2400;
    const t = every(() => {
      v -= 130;
      if (v <= 600) {
        v = 600;
        t.stop();
        face("curious");
        helper.innerHTML = "600까지 뚝 떨어졌어요. 그런데 이상하죠. 닫힌 교실에서 <b>이산화 탄소는 늘고 산소는 줄어든</b> 까닭이 뭘까요?";
        later(() => {
          ask(box, helper, {
            choices: choices ?? [
              "교실에 있던 사람들의 몸이 산소를 쓰고 이산화 탄소를 내보냈어요",
              "창문 틈으로 산소만 골라서 빠져나갔어요",
              "교실이 더워지면서 산소가 천장 쪽으로 다 올라갔어요",
            ],
            good: "맞아요! 우리 몸은 쉬는 동안에도 끊임없이 <b>산소를 쓰고 이산화 탄소를 내보내요</b>. 그 주고받기가 몸속 어디에서 일어나는지, 이번 레슨에서 두 장소를 찾아봐요!",
            bad: "기체는 종류를 골라 새어 나가지도, 무거워서 층으로 갈라지지도 않아요. 답은 <b>사람</b>이에요. 교실 속 우리가 산소를 쓰고 이산화 탄소를 내보낸 거죠. 그 교환이 어디서 일어나는지 확인해 봐요!",
            onDone: finish,
          });
        }, 950);
      }
      num.textContent = String(v);
    }, 90);
  });
};

/* ── 11. saltysnack — 짠 과자와 물 (L11 배설) ────────────────────────── */
export const renderSaltysnack: AnimalSceneFn = (scene, helper, finish, face, choices) => {
  const { fig, btn, box } = mount(
    scene,
    wrapSvg(
      `<rect x="8" y="10" width="344" height="180" rx="16" fill="url(#ss-bg)"/>
      ${SH(96, 168, 46, 0.13)}${SH(238, 168, 30, 0.13)}
      <path d="M56 96 q40 -22 80 0 l-8 66 q-32 10 -64 0 Z" fill="url(#ss-bag)" stroke="#9A7414" stroke-width="1.6"/>
      <path d="M56 96 q40 -22 80 0" stroke="#FFFFFF" stroke-width="2.4" opacity=".45" fill="none"/>
      ${[0, 1, 2, 3, 4].map((i) => `<circle cx="${72 + (i % 3) * 24}" cy="${118 + Math.floor(i / 3) * 22}" r="7" fill="url(#ss-chip)"/>`).join("")}
      <g class="ss-cup" style="transform-origin:238px 150px;transition:transform .9s var(--ease)">
        <path d="M216 92 h44 l-6 68 h-32 Z" fill="url(#ss-glass)" stroke="#9AB2C4" stroke-width="1.6"/>
        <path class="ss-water" d="M219 110 h38 l-5 50 h-28 Z" fill="url(#ss-water)" style="transition:opacity .6s"/>
      </g>
      <g class="ss-sign" style="opacity:0;transition:opacity .5s">
        <rect x="286" y="52" width="54" height="54" rx="12" fill="#EAF4FF" stroke="#3182F6" stroke-width="2"/>
        <circle cx="304" cy="70" r="6" fill="#3182F6"/>
        <path d="M304 78 v16 M298 84 h12 M300 94 l-3 8 M308 94 l3 8" stroke="#3182F6" stroke-width="2.6" stroke-linecap="round"/>
        <circle cx="324" cy="70" r="6" fill="#3182F6"/>
        <path d="M324 78 v14 l-6 10 M324 92 l6 10 M318 84 h12" stroke="#3182F6" stroke-width="2.6" stroke-linecap="round"/>
      </g>
      <text x="96" y="72" text-anchor="middle" font-size="12" font-weight="900" fill="#8A6A2A">아주 짠 과자</text>`,
      `${lg3("ss-bg", "#FFFBF3", "#FBF3E6", "#F2E7D4")}
      ${lg3("ss-bag", "#FFE9A8", "#EBC24E", "#9A7414")}
      ${rg3("ss-chip", "#FFE0A0", "#E2A63C", "#9A6A14")}
      ${lg3("ss-glass", "#FFFFFF", "#F2F7FB", "#DCE7F0")}
      ${lg3("ss-water", SUBSTANCE.water.hi, SUBSTANCE.water.mid, SUBSTANCE.water.lo)}`,
    ),
    "물 한 컵 벌컥벌컥 마시기",
  );
  helper.innerHTML = "아주 짠 과자를 한 봉지 다 먹었어요. 목이 말라 물을 벌컥벌컥 들이켜면, 그 물과 짠 성분은 몸속에서 어떻게 될까요?";

  once(btn, () => {
    const cup = q<SVGGElement>(fig, ".ss-cup");
    cup.style.transform = "rotate(-34deg) translate(-6px,-10px)";
    later(() => {
      show(fig, ".ss-water", "0");
      cup.style.transform = "rotate(0deg)";
    }, 700);
    later(() => {
      show(fig, ".ss-sign");
      face("surprised");
      helper.innerHTML = "얼마 뒤 화장실이 급해졌어요! 몸은 마신 물 중 <b>남는 만큼</b>과, 몸이 만들어 낸 <b>노폐물</b>을 함께 내보내려는 거예요.";
      later(() => {
        ask(box, helper, {
          choices: choices ?? [
            "콩팥이 혈액을 걸러서 필요한 것은 되돌리고 나머지를 내보내요",
            "위가 남는 물을 곧바로 아래로 흘려보내요",
            "방광이 혈액에서 직접 물을 뽑아내 모아 둬요",
          ],
          good: "맞아요! <b>콩팥</b>은 혈액을 통째로 거른 뒤, 몸에 필요한 것만 다시 돌려받는 아주 똑똑한 여과 장치예요. 어떻게 그런 일이 가능한지 이번 레슨에서 직접 걸러 봐요!",
          bad: "위는 음식을 소화하는 곳이고, 방광은 만들어진 오줌을 <b>저장만</b> 하는 주머니예요. 혈액을 실제로 거르는 기관은 <b>콩팥</b>이랍니다. 이번 레슨의 주인공이죠!",
          onDone: finish,
        });
      }, 1000);
    }, 1400);
  });
};

/* ── 12. afterswim — 물놀이 뒤 헉헉 (L12 세포호흡) ───────────────────── */
export const renderAfterswim: AnimalSceneFn = (scene, helper, finish, face, choices) => {
  const { fig, btn, box } = mount(
    scene,
    wrapSvg(
      `<rect x="8" y="10" width="344" height="180" rx="16" fill="url(#as-bg)"/>
      <path d="M8 132 q45 -12 90 0 t90 0 t90 0 t74 0 v58 H8 Z" fill="url(#as-water)" opacity=".9"/>
      <g class="as-kid" style="transition:transform .8s var(--ease)">
        <circle cx="112" cy="98" r="15" fill="url(#as-skin)" stroke="#B07A56" stroke-width="1.5"/>
        <path d="M112 113 v26 M112 120 l-18 12 M112 120 l18 12 M112 139 l-12 20 M112 139 l12 20" stroke="#40506A" stroke-width="4" stroke-linecap="round"/>
        <ellipse cx="112" cy="128" rx="26" ry="13" fill="url(#as-tube)" stroke="#C4531C" stroke-width="1.5"/>
      </g>
      <g class="as-pant" style="opacity:1;transition:opacity .5s">
        <path d="M132 82 q12 -8 22 -2 M138 70 q14 -8 24 0" stroke="#8FA3B8" stroke-width="2.6" stroke-linecap="round"/>
      </g>
      <rect x="212" y="66" width="118" height="20" rx="10" fill="#E6ECF4" stroke="#C6D2DE" stroke-width="1.4"/>
      <rect class="as-gauge" x="215" y="69" width="24" height="14" rx="7" fill="url(#as-energy)" style="transition:width 1.1s var(--ease)"/>
      <text x="271" y="58" text-anchor="middle" font-size="11.5" font-weight="900" fill="#8A6A2A">남은 힘</text>
      <g class="as-food" style="opacity:0;transition:opacity .5s">
        <rect x="236" y="112" width="70" height="40" rx="10" fill="url(#as-bread)" stroke="#9A5C10" stroke-width="1.5"/>
        <path d="M246 126 h50 M246 138 h34" stroke="#C08A3A" stroke-width="2.4" stroke-linecap="round"/>
      </g>`,
      `${lg3("as-bg", "#F2FAFE", "#E6F4FB", "#D6EBF6")}
      ${lg3("as-water", "#8FD8F2", "#4FB6DE", "#2079A6")}
      ${rg3("as-skin", "#F7D9C2", "#E5B48F", "#B07A56")}
      ${lg3("as-tube", "#FFC49A", "#F0834A", "#C4531C")}
      ${lg3("as-energy", SUBSTANCE.energy.hi, SUBSTANCE.energy.mid, SUBSTANCE.energy.lo)}
      ${lg3("as-bread", SUBSTANCE.starch.hi, SUBSTANCE.starch.mid, SUBSTANCE.starch.lo)}`,
    ),
    "간식 먹고 숨 고르기",
  );
  helper.innerHTML = "물놀이를 한참 했더니 <b>헉헉</b>, 더는 못 움직이겠어요. 남은 힘 막대가 거의 바닥이네요. 간식을 먹고 숨을 고르면 어떻게 될까요?";

  once(btn, () => {
    show(fig, ".as-food");
    later(() => {
      q<SVGRectElement>(fig, ".as-gauge").setAttribute("width", "112");
      show(fig, ".as-pant", "0");
      q<SVGGElement>(fig, ".as-kid").style.transform = "translateY(-6px)";
    }, 600);
    later(() => {
      face("smile");
      helper.innerHTML = "힘이 다시 가득 찼어요! 먹은 <b>영양소</b>와 들이마신 <b>산소</b>가 만나 에너지가 된 거예요. 그런데 그 일은 몸속 <b>어디에서</b> 일어날까요?";
      later(() => {
        ask(box, helper, {
          choices: choices ?? [
            "온몸의 세포 하나하나에서 일어나요",
            "위에서 음식이 소화될 때 한꺼번에 만들어져요",
            "허파에서 산소를 들이마시는 순간 만들어져요",
          ],
          good: "맞아요! 에너지는 <b>온몸의 세포</b> 하나하나에서 만들어져요. 그러려면 네 기관계가 힘을 합쳐야 하죠. 마지막 레슨에서 그 팀워크를 관제실에서 지켜봐요!",
          bad: "소화계는 영양소를 <b>준비</b>하고, 호흡계는 산소를 <b>받아들일</b> 뿐이에요. 둘이 실제로 만나 에너지가 되는 곳은 <b>온몸의 세포</b> 하나하나랍니다. 마지막 레슨에서 그 현장을 확인해요!",
          onDone: finish,
        });
      }, 1000);
    }, 1500);
  });
};

registerAnimalScenes({
  spintube: renderSpintube,
  twoloop: renderTwoloop,
  holdbreath: renderHoldbreath,
  windowair: renderWindowair,
  saltysnack: renderSaltysnack,
  afterswim: renderAfterswim,
});
