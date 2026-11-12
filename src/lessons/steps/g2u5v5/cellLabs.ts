// [중2 Ⅴ v5] g2u5l1의 랩 두 판.
//
// g2u5ScopeLab 「초록 잎의 세포에는 무엇이 있을까요?」
//   책의 그림(상추와 검정말의 잎세포를 현미경으로 본 모습)을 손으로 한다. 학생이 정하는 것: 현미경에 올릴 표본.
//   초록색인 검정말 잎과 상추 잎의 세포에는 초록 알갱이가 가득하고, 초록색이 아닌 양파 속껍질의 세포에는 없다(견줄 대상).
//   판정: 초록 알갱이가 보인 표본. 결론: 초록색 부분의 세포에는 엽록체가 있고 광합성은 여기서 일어난다.
//
// g2u5SupplyLab 「무엇이 다 있어야 양분이 만들어질까요?」
//   책의 광합성 과정 그림을 손으로 움직인다. 학생이 정하는 것: 빛, 이산화 탄소, 물을 주고 끊는 일.
//   실패하는 길: 셋 가운데 하나라도 없으면 포도당과 산소가 생기지 않는다(무엇이 없는지 무대에 뜬다).
//   판정: 광합성으로 만들어진 것. 결론: 빛에너지로 이산화 탄소와 물을 써서 포도당과 산소를 만든다.

import type { StepRenderer } from "../../types";
import { P, arrow, bad, bvBtn, chip, g5Lab, g5Svg, gasDot, good, row, tag, tap, txt, type G5Step } from "./kit";

// ── 현미경 관찰 ─────────────────────────────────────────────────────
const rnd = (n: number): number => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const CX = 112;
const CY = 118;
const R = 92;

function cellsOf(kind: "elodea" | "lettuce" | "onion"): string {
  let out = "";
  if (kind === "elodea") {
    // 검정말: 벽돌처럼 늘어선 긴 네모 세포, 벽을 따라 초록 알갱이
    for (let r = 0; r < 9; r++) {
      for (let c = -1; c < 6; c++) {
        const x = CX - R + c * 46 + (r % 2) * 23 - 6;
        const y = CY - R + r * 24 - 8;
        out += `<rect x="${x}" y="${y}" width="46" height="24" fill="#E3F4D8" stroke="#5C9A52" stroke-width="1.6"/>`;
        for (let k = 0; k < 7; k++) {
          const s = r * 31 + c * 7 + k;
          const side = k % 4;
          const t = 0.15 + rnd(s) * 0.7;
          const gx = side < 2 ? x + 6 + t * 34 : side === 2 ? x + 7 : x + 39;
          const gy = side === 0 ? y + 6 : side === 1 ? y + 18 : y + 6 + t * 12;
          out += `<ellipse cx="${gx.toFixed(1)}" cy="${gy.toFixed(1)}" rx="4" ry="2.9" fill="#2E9E48" stroke="#1F6B3A" stroke-width=".7" transform="rotate(${Math.round(rnd(s + 9) * 90 - 45)} ${gx.toFixed(1)} ${gy.toFixed(1)})"/>`;
        }
      }
    }
  } else if (kind === "lettuce") {
    // 상추: 둥글둥글한 세포가 빽빽하고 초록 알갱이가 흩어져 있다
    for (let r = 0; r < 7; r++) {
      for (let c = -1; c < 7; c++) {
        const x = CX - R + c * 33 + (r % 2) * 16.5;
        const y = CY - R + r * 29 + 4;
        out += `<ellipse cx="${x}" cy="${y}" rx="17.5" ry="15.5" fill="#E8F6DF" stroke="#6AA85E" stroke-width="1.5"/>`;
        for (let k = 0; k < 6; k++) {
          const s = r * 53 + c * 11 + k;
          const a = rnd(s) * Math.PI * 2;
          const d = 4 + rnd(s + 3) * 8;
          out += `<circle cx="${(x + Math.cos(a) * d).toFixed(1)}" cy="${(y + Math.sin(a) * d * 0.85).toFixed(1)}" r="3" fill="#34A853" stroke="#1F6B3A" stroke-width=".7"/>`;
        }
      }
    }
  } else {
    // 양파 속껍질: 길쭉한 세포마다 핵 하나, 초록 알갱이는 없다
    for (let r = 0; r < 9; r++) {
      for (let c = -1; c < 4; c++) {
        const x = CX - R + c * 66 + (r % 2) * 33 - 8;
        const y = CY - R + r * 23 - 6;
        out += `<rect x="${x}" y="${y}" width="66" height="23" rx="5" fill="#FAF3F0" stroke="#B79C94" stroke-width="1.5"/>`;
        out += `<circle cx="${x + 18 + rnd(r * 17 + c) * 30}" cy="${y + 11.5}" r="3.6" fill="#D9BDB3" stroke="#A88478" stroke-width=".8"/>`;
      }
    }
  }
  return out;
}

const SPEC = {
  elodea: { name: "검정말 잎", color: "초록색", grains: "가득", say: "검정말 잎의 세포예요. 세포마다 <b>초록 알갱이</b>가 가득해요." },
  lettuce: { name: "상추 잎", color: "초록색", grains: "가득", say: "상추 잎의 세포에도 <b>초록 알갱이</b>가 들어 있어요." },
  onion: { name: "양파 속껍질", color: "흰색", grains: "없음", say: "양파 속껍질의 세포에는 초록 알갱이가 <b>보이지 않아요</b>." },
} as const;
type SpecKey = keyof typeof SPEC;

export const g2u5ScopeLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G5Step;
  const lab = g5Lab(host, api, s, { steps: 2, cls: "g2u5x-scope", wait: "세 표본을 관찰해 보세요" });
  const { f } = lab;
  const stage = g5Svg(lab, "현미경으로 본 표본의 세포");
  const seen = new Set<SpecKey>();
  let now: SpecKey | null = null;

  const draw = (): void => {
    const sp = now ? SPEC[now] : null;
    const view = now
      ? `<g clip-path="url(#g2u5xScope)"><rect x="${CX - R}" y="${CY - R}" width="${R * 2}" height="${R * 2}" fill="#F4F8EE"/><g class="g2u5x-focus">${cellsOf(now)}</g></g>`
      : `<circle cx="${CX}" cy="${CY}" r="${R}" fill="#1A2942"/>${txt(CX, CY - 4, "표본을 골라", { size: 13 })}${txt(CX, CY + 14, "현미경에 올려요", { size: 13 })}`;
    const row3 = (y: number, k: string, v: string, hot = false): string => txt(232, y, k, { anchor: "start", size: 12, fill: P.dim }) + txt(232, y + 18, v, { anchor: "start", size: 14, fill: hot ? P.leafHi : "#E8EEF9", weight: 800 });
    stage.set(`
      <defs><clipPath id="g2u5xScope"><circle cx="${CX}" cy="${CY}" r="${R}"/></clipPath></defs>
      ${view}
      <circle cx="${CX}" cy="${CY}" r="${R}" fill="none" stroke="#0A1322" stroke-width="7"/><circle cx="${CX}" cy="${CY}" r="${R + 4}" fill="none" stroke="#46587A" stroke-width="2"/>
      ${sp ? row3(58, "올린 표본", sp.name) + row3(108, "표본의 색", sp.color) + row3(158, "초록 알갱이", sp.grains, sp.grains === "가득") : txt(280, 118, "400배로 확대", { size: 12.5, fill: P.dim })}
    `);
    host.dataset.g5Spec = now ?? "";
    host.dataset.g5Seen = String(seen.size);
  };

  const chips = (Object.keys(SPEC) as SpecKey[]).map((k) =>
    chip(k, SPEC[k].name, "", () => {
      tap();
      now = k;
      seen.add(k);
      chips.forEach((c) => c.on(c.el.dataset.k === k));
      chips.find((c) => c.el.dataset.k === k)?.done();
      draw();
      f.say(seen.size < 3 ? `${SPEC[k].say} 다른 표본도 봐요.` : `${SPEC[k].say} 이제 셋을 견줘 봐요.`);
      if (seen.size === 3) {
        f.pips(1);
        go.disabled = false;
      }
    }),
  );
  const go = bvBtn("main g2u5x-go", "세 표본 견주기");
  go.disabled = true;
  go.addEventListener("click", () => {
    tap();
    lab.judge("<b>초록 알갱이</b>가 보인 표본은?", [{ t: "초록색인 검정말 잎과 상추 잎", ok: true }, { t: "흰색인 양파 속껍질" }, { t: "세 표본 모두" }], "초록 알갱이는 <b>초록색 부분</b>의 세포에만 있어요.", () =>
      lab.finish("식물의 초록색 부분 세포에는 초록 알갱이 <b>엽록체</b>가 들어 있어요. 광합성은 이 엽록체에서 일어나요."),
    );
  });
  f.slot.setControls(row(...chips.map((c) => c.el)), go);
  draw();
  f.say("표본 셋을 차례로 <b>현미경</b>에 올려 세포 속을 들여다봐요.");
  return lab.cleanup;
};

// ── 광합성 재료 공급 ────────────────────────────────────────────────
type Feed = "light" | "co2" | "water";
const FEED: Record<Feed, { name: string; lack: string }> = {
  light: { name: "빛", lack: "빛이 없어요" },
  co2: { name: "이산화 탄소", lack: "이산화 탄소가 없어요" },
  water: { name: "물", lack: "물이 없어요" },
};

export const g2u5SupplyLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G5Step;
  const lab = g5Lab(host, api, s, { steps: 3, cls: "g2u5x-supply", wait: "세 가지를 주고 끊어 보세요" });
  const { f, tm } = lab;
  const stage = g5Svg(lab, "빛, 이산화 탄소, 물을 받는 잎과 그 속의 엽록체");
  const on: Record<Feed, boolean> = { light: false, co2: false, water: false };
  let ran = false; // 셋 다 주어 만들어지는 것을 봤다
  let cut = false; // 그 뒤 하나를 끊어 멈추는 것을 봤다

  const running = (): boolean => on.light && on.co2 && on.water;
  const lacks = (): Feed[] => (Object.keys(on) as Feed[]).filter((k) => !on[k]);

  // 잎: 가운데 (196, 112), 엽록체는 그 안의 타원. 줄기는 x 96. 흙은 y 196 아래.
  const draw = (): void => {
    const run = running();
    const dim = (v: boolean): string => (v ? "1" : ".28");
    const hex = (x: number, y: number, i: number): string =>
      `<polygon class="g2u5x-pop" style="animation-delay:${i * 0.35}s" points="${[0, 1, 2, 3, 4, 5].map((k) => `${(x + Math.cos((k * Math.PI) / 3) * 7).toFixed(1)},${(y + Math.sin((k * Math.PI) / 3) * 7).toFixed(1)}`).join(" ")}" fill="${P.sugar}" stroke="#8A5A00" stroke-width="1.2"/>`;
    const lk = lacks();
    stage.set(`
      <rect x="0" y="196" width="346" height="34" fill="#3B2A1E"/><line x1="0" y1="196" x2="346" y2="196" stroke="#6B4A32" stroke-width="2"/>
      <path d="M96 196 C 96 160, 98 140, 104 122" fill="none" stroke="#2F7D46" stroke-width="7" stroke-linecap="round"/>
      <path d="M96 196 C 92 206, 84 212, 74 218 M96 196 C 100 208, 108 214, 118 220 M96 198 L96 222" fill="none" stroke="#B79469" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M104 122 C 130 66, 250 52, 292 100 C 262 158, 150 170, 104 122 Z" fill="${P.leaf}" stroke="${P.leafDark}" stroke-width="2"/>
      <path d="M104 122 C 170 108, 240 102, 290 100" fill="none" stroke="${P.leafDark}" stroke-width="1.4" opacity=".6"/>
      <ellipse cx="200" cy="112" rx="50" ry="27" fill="#1E7A3C" stroke="#0F4F26" stroke-width="1.6"/>
      ${txt(200, 96, "엽록체", { size: 12, fill: "#CFF5D6" })}
      <g opacity="${dim(on.light)}"><circle cx="36" cy="34" r="15" fill="${P.energy}" stroke="#B8860B" stroke-width="1.5"/>${[0, 1, 2, 3, 4, 5, 6, 7].map((k) => `<line x1="${36 + Math.cos((k * Math.PI) / 4) * 20}" y1="${34 + Math.sin((k * Math.PI) / 4) * 20}" x2="${36 + Math.cos((k * Math.PI) / 4) * 26}" y2="${34 + Math.sin((k * Math.PI) / 4) * 26}" stroke="${P.energy}" stroke-width="2.4" stroke-linecap="round"/>`).join("")}</g>
      ${on.light ? arrow(58, 46, 150, 92, P.energy, 2.6, "g2u5x-flow") : ""}
      ${txt(36, 74, "빛", { size: 12.5, fill: on.light ? P.energy : P.dim })}
      <g opacity="${dim(on.co2)}">${gasDot(314, 150, "co2")}${gasDot(326, 164, "co2")}${gasDot(306, 168, "co2")}</g>
      ${on.co2 ? arrow(302, 152, 252, 132, P.co2, 2.6, "g2u5x-flow") : ""}
      ${txt(302, 190, "이산화 탄소", { size: 12.5, fill: on.co2 ? P.co2 : P.dim })}
      <g opacity="${dim(on.water)}"><path d="M40 204 q5 -9 10 0 a5 5 0 0 1 -10 0 Z M56 212 q5 -9 10 0 a5 5 0 0 1 -10 0 Z" fill="${P.water}" stroke="#2F6FA8" stroke-width="1"/></g>
      ${on.water ? `<path d="M90 190 C 90 160, 92 140, 98 124" fill="none" stroke="${P.water}" stroke-width="3" stroke-linecap="round" stroke-dasharray="5 6" class="g2u5x-dash"/>` + arrow(110, 122, 150, 116, P.water, 2.6, "g2u5x-flow") : ""}
      ${txt(30, 190, "물", { size: 12.5, fill: on.water ? P.water : P.dim })}
      ${run ? hex(182, 116, 0) + hex(200, 122, 1) + hex(218, 116, 2) + txt(200, 152, "포도당", { size: 12.5, fill: P.sugar }) : ""}
      ${run ? gasDot(238, 62, "o2", 5.5, "g2u5x-rise") + gasDot(254, 56, "o2", 5.5, "g2u5x-rise d1") + gasDot(246, 70, "o2", 5.5, "g2u5x-rise d2") + txt(286, 44, "산소", { size: 12.5, fill: P.o2 }) : ""}
      ${run ? tag(196, 26, "양분을 만드는 중", { fill: P.leafHi }) : tag(196, 26, lk.length === 3 ? "아무것도 주지 않았어요" : `멈춤: ${FEED[lk[0]].lack}`, { fill: P.bad })}
    `);
    host.dataset.g5Run = run ? "1" : "0";
  };

  let timer = 0;
  const chips = (Object.keys(FEED) as Feed[]).map((k) =>
    chip(k, FEED[k].name, "끊음", () => {
      on[k] = !on[k];
      const c = chips.find((x) => x.el.dataset.k === k);
      c?.on(on[k]);
      c?.sub(on[k] ? "주는 중" : "끊음");
      tm.cancel(timer);
      draw();
      if (running()) {
        good();
        if (cut) {
          f.say("다시 <b>포도당과 산소</b>가 만들어져요. 무엇이 만들어지는지 확인해요.");
          go.disabled = false;
        } else {
          f.say("셋이 모이자 엽록체에서 <b>포도당</b>과 <b>산소</b>가 생겨요.");
          timer = tm.later(() => {
            ran = true;
            f.pips(1);
            f.say("이번에는 셋 가운데 <b>하나를 끊어</b> 보세요. 어떻게 될까요?");
          }, 1500);
        }
        return;
      }
      go.disabled = true;
      const lk = lacks();
      if (ran && !cut && !on[k]) {
        bad();
        cut = true;
        f.pips(2);
        f.say(`${FEED[k].name}${k === "light" ? "을" : "를"} 끊자 <b>바로 멈췄어요</b>. 다시 주고 이어 가요.`);
        return;
      }
      tap();
      f.say(lk.length === 3 ? "아무것도 없으면 양분을 만들지 못해요. 하나씩 줘 보세요." : `아직 만들어지지 않아요. <b>${lk.map((x) => FEED[x].name).join(", ")}</b>도 줘 보세요.`);
    }),
  );
  const go = bvBtn("main g2u5x-go", "만들어진 것 확인하기");
  go.disabled = true;
  go.addEventListener("click", () => {
    tap();
    lab.judge("엽록체에서 <b>만들어진</b> 것은?", [{ t: "포도당과 산소", ok: true }, { t: "이산화 탄소와 물" }, { t: "빛과 이산화 탄소" }], "이산화 탄소와 물은 <b>재료</b>, 포도당과 산소는 <b>만들어진 것</b>이에요.", () =>
      lab.finish("식물은 <b>빛에너지</b>로 <b>이산화 탄소와 물</b>을 써서 <b>포도당과 산소</b>를 만들어요. 하나라도 없으면 만들지 못해요."),
    );
  });
  f.slot.setControls(row(...chips.map((c) => c.el)), go);
  draw();
  f.say("잎에 <b>빛, 이산화 탄소, 물</b>을 줄 수 있어요. 무엇을 줘야 양분이 생길까요?");
  return lab.cleanup;
};
