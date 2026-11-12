// [중2 Ⅱ v5] g2u2l1 랩 1: 「이것은 지구의 어느 영역일까요?」
// 책의 해 보기(지구의 모습이 담긴 사진에서 지구를 이루는 요소를 찾아 정리한다)를 풍경 한 장에서 손으로 한다.
// 학생이 정하는 것: 풍경 속 여섯 가지(바다, 토양, 빙하, 공기, 태양, 나무)를 어느 영역에 넣을지. 고를 차례도 학생이 정한다.
// 틀리는 길: 다른 영역에 넣으면 들어가지 않고 까닭이 한 줄로 나온다(빙하를 지권에, 태양을 기권에 넣는 일이 잦다).
// 판정 하나: 물속에 사는 물고기는 어느 영역인가. 통찰 하나: 지구를 이루는 것은 다섯 영역으로 나뉜다.

import type { StepRenderer } from "../../types";
import { gGrid, gLab, gPick, gTap, haptic, HAPTIC, svgOpen, el, type GStep } from "./kit";

type Sph = "air" | "water" | "land" | "life" | "space";
const SPH: Record<Sph, { name: string; sub: string; color: string }> = {
  air: { name: "기권", sub: "지구의 대기", color: "#9AD1FF" },
  water: { name: "수권", sub: "물이 있는 영역", color: "#4DA3FF" },
  land: { name: "지권", sub: "땅과 지구 속", color: "#D69A5B" },
  life: { name: "생물권", sub: "모든 생물", color: "#63D67A" },
  space: { name: "외권", sub: "지구 밖 우주", color: "#B9A2FF" },
};
const ITEMS: { k: string; name: string; at: [number, number]; s: Sph; why: string }[] = [
  { k: "sea", name: "바다", at: [272, 190], s: "water", why: "바다는 <b>물</b>이 모여 있는 곳이에요." },
  { k: "soil", name: "토양", at: [84, 190], s: "land", why: "토양은 <b>땅</b>을 이루는 흙이에요." },
  { k: "ice", name: "빙하", at: [62, 100], s: "water", why: "빙하는 얼음이에요. 얼음도 <b>물</b>이에요." },
  { k: "wind", name: "공기", at: [206, 84], s: "air", why: "공기는 지구를 둘러싼 <b>기체</b>예요." },
  { k: "sun", name: "태양", at: [304, 26], s: "space", why: "태양은 <b>지구 밖 우주</b>에 있는 천체예요." },
  { k: "tree", name: "나무", at: [146, 132], s: "life", why: "나무는 <b>살아 있는</b> 생물이에요." },
];

const SCENE = `${svgOpen}
  <defs>
    <linearGradient id="g2sSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2B6CB8"/><stop offset="1" stop-color="#8EC3EE"/></linearGradient>
    <linearGradient id="g2sSea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2F86D6"/><stop offset="1" stop-color="#17508F"/></linearGradient>
    <linearGradient id="g2sMt" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8A9A86"/><stop offset="1" stop-color="#55654F"/></linearGradient>
    <linearGradient id="g2sSoil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A9753F"/><stop offset="1" stop-color="#6B4525"/></linearGradient>
    <radialGradient id="g2sSun" cx="0.4" cy="0.4" r="0.7"><stop offset="0" stop-color="#FFF3B0"/><stop offset="1" stop-color="#FFB703"/></radialGradient>
  </defs>
  <rect width="346" height="46" fill="#070D1C"/>
  ${[[24, 14], [70, 30], [118, 10], [168, 26], [222, 12], [262, 34], [336, 40]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.2" fill="#fff" opacity=".8"/>`).join("")}
  <rect y="44" width="346" height="120" fill="url(#g2sSky)"/>
  <circle cx="304" cy="26" r="15" fill="url(#g2sSun)"/>
  <g stroke="#FFD76A" stroke-width="2" stroke-linecap="round">${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => { const a = (i * Math.PI) / 4; return `<path d="M${(304 + Math.cos(a) * 19).toFixed(1)} ${(26 + Math.sin(a) * 19).toFixed(1)} L${(304 + Math.cos(a) * 24).toFixed(1)} ${(26 + Math.sin(a) * 24).toFixed(1)}"/>`; }).join("")}</g>
  <g fill="#fff" opacity=".92"><ellipse cx="196" cy="84" rx="26" ry="11"/><ellipse cx="214" cy="76" rx="18" ry="12"/><ellipse cx="228" cy="86" rx="16" ry="9"/></g>
  <g stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7"><path d="M150 100 h34"/><path d="M162 108 h28"/><path d="M240 104 h30"/></g>
  <path d="M0 168 L62 76 L104 136 L132 116 L186 168 Z" fill="url(#g2sMt)"/>
  <path d="M41 107 L62 76 L83 106 L72 99 L62 110 L52 99 Z" fill="#EAF6FF" stroke="#B9DBF2" stroke-width="1.2"/>
  <path d="M0 162 H178 C190 166 196 176 204 230 H0 Z" fill="url(#g2sSoil)"/>
  <path d="M0 162 H178" stroke="#6FBF5A" stroke-width="5" stroke-linecap="round"/>
  <g fill="#5A3A1E" opacity=".55">${[[20, 186], [44, 210], [86, 184], [112, 212], [140, 192], [70, 222]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="5" ry="3"/>`).join("")}</g>
  <path d="M176 164 C190 160 206 166 220 162 C240 156 262 168 286 162 C306 157 326 166 346 161 V230 H204 C198 190 190 170 176 164 Z" fill="url(#g2sSea)"/>
  <g stroke="#CFE8FF" stroke-width="1.8" stroke-linecap="round" opacity=".8"><path d="M232 182 q7 -5 14 0 t14 0"/><path d="M286 206 q7 -5 14 0 t14 0"/><path d="M224 214 q6 -4 12 0"/></g>
  <rect x="143" y="140" width="6" height="22" rx="2" fill="#7A5230"/>
  <circle cx="146" cy="128" r="15" fill="#3FA65A"/><circle cx="137" cy="136" r="9" fill="#4DBB69"/><circle cx="156" cy="135" r="9" fill="#35934E"/>
</svg>`;

export const g2u2SystemLab: StepRenderer = (host, step, api) => {
  const lab = gLab(host, api, step as unknown as GStep, { steps: 3, cls: "g2u2x-sys" });
  const { f } = lab;
  f.stage.innerHTML = SCENE;

  let sel = 0;
  const done = new Set<string>();
  const taps = ITEMS.map((it, i) => {
    const b = gTap(lab, it.k, `${it.name} 고르기`, it.at[0], it.at[1], 56, 50);
    const tag = el("span", { class: "g2u2x-tag", text: it.name });
    b.appendChild(tag);
    b.addEventListener("click", () => {
      if (done.has(it.k)) return;
      haptic(HAPTIC.tap);
      pick(i);
    });
    return { b, tag };
  });
  const picks = (Object.keys(SPH) as Sph[]).map((s) => {
    const p = gPick(s, SPH[s].name, SPH[s].sub, SPH[s].color);
    p.el.addEventListener("click", () => put(s, p.el));
    return p;
  });
  const hintNow = (): void => lab.hint(ITEMS[sel].s);

  function pick(i: number): void {
    sel = i;
    taps.forEach((t, j) => t.b.classList.toggle("sel", j === i && !done.has(ITEMS[j].k)));
    f.say(`<b>${ITEMS[i].name}</b>${"토양태양".includes(ITEMS[i].name) ? "은" : "는"} 지구의 어느 영역에 속할까요? 아래에서 골라 보세요.`);
    hintNow();
  }

  function put(s: Sph, btn: HTMLButtonElement): void {
    const it = ITEMS[sel];
    if (done.has(it.k) || lab.finished()) return;
    if (s !== it.s) {
      haptic(HAPTIC.wrong);
      btn.classList.remove("g2u2x-shake");
      void btn.offsetWidth;
      btn.classList.add("g2u2x-shake");
      f.say(`${SPH[s].name}에는 들어가지 않아요. ${it.why} 다시 골라 보세요.`);
      host.dataset.g2Miss = String(Number(host.dataset.g2Miss ?? 0) + 1);
      return;
    }
    haptic(HAPTIC.correct);
    done.add(it.k);
    const t = taps[sel];
    t.b.classList.remove("sel");
    t.b.classList.add("done");
    t.tag.textContent = `${it.name} · ${SPH[s].name}`;
    t.tag.style.setProperty("--tc", SPH[s].color);
    f.pips(done.size >= 3 ? 1 : 0);
    if (done.size === ITEMS.length) {
      f.pips(2);
      f.say("여섯 가지가 모두 제 영역을 찾았어요. 하나만 더 생각해 볼까요?");
      lab.tm.later(judge, 900);
      return;
    }
    const next = ITEMS.findIndex((x) => !done.has(x.k));
    pick(next);
    f.say(`${it.why} 다음은 <b>${ITEMS[next].name}</b>예요. 다른 것을 눌러 골라도 돼요.`);
  }

  function judge(): void {
    lab.ask(
      "바닷속을 헤엄치는 <b>물고기</b>는 어느 영역에 속할까요?",
      ["생물권", "수권", "지권"],
      "물속에 살아도 <b>생물</b>은 모두 생물권이에요. 수권은 물 그 자체예요.",
      () => lab.finish("지구를 이루는 것은 <b>기권, 수권, 지권, 생물권, 외권</b>의 다섯 영역으로 나눌 수 있어요. 얼음인 빙하도 물이라 수권이고, 어디에 살든 생물은 생물권이에요."),
    );
  }

  f.slot.setControls(gGrid(3, ...picks));
  pick(0);
  f.say("빛나는 <b>바다</b>부터 해 볼까요? 바다가 속하는 영역을 아래에서 골라 보세요.");
  api.setCTA("여섯 가지를 영역에 넣어 보세요", { enabled: false });
  return lab.cleanup;
};
