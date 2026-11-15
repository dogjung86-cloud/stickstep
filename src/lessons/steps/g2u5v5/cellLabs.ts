// [중2 Ⅴ v5] g2u5l1의 랩 두 판.
//
// g2u5ScopeLab 「초록 잎의 세포에는 무엇이 있을까요?」
//   책의 그림(상추와 검정말의 잎세포를 현미경으로 본 모습)을 손으로 한다. 학생이 정하는 것: 현미경에 올릴 표본.
//   초록색인 검정말 잎과 상추 잎의 세포에는 초록 알갱이가 가득하고, 초록색이 아닌 양파 속껍질의 세포에는 없다(견줄 대상).
//   판정: 초록 알갱이가 보인 표본. 결론: 초록색 부분의 세포에는 엽록체가 있고 광합성은 여기서 일어난다.
//   그림(2026-11-15 다시 그림): 시야는 책의 사진처럼 세포벽, 벽을 따라 늘어선 엽록체, 눈금 막대(40 μm, 세 표본 같은 배율)를 그린다. 처음에는 광학 현미경.
//
// g2u5SupplyLab 「무엇이 다 있어야 양분이 만들어질까요?」
//   책의 광합성 과정 그림을 손으로 움직인다. 학생이 정하는 것: 빛, 이산화 탄소, 물을 주고 끊는 일.
//   실패하는 길: 셋 가운데 하나라도 없으면 포도당과 산소가 생기지 않는다(무엇이 없는지 무대에 뜬다).
//   판정: 광합성으로 만들어진 것. 결론: 빛에너지로 이산화 탄소와 물을 써서 포도당과 산소를 만든다.
//   그림(2026-11-15 다시 그림, 같은 날 손봄): 왼쪽은 흙에 뿌리를 내린 식물(물은 뿌리털에서 줄기의 물관을 따라 잎으로), 오른쪽 원은 잎의 한 점을 크게 본
//   잎세포 속 엽록체. 원 안에서는 재료 셋이 엽록체로 들어가는 길이 주인공이다: 준 재료는 그 색의 화살과 흘러드는 입자, 끊은 재료는 회색 점선 화살과
//   빈 자리. 엽록체의 속 구조(그라나)는 옅게 둔다(진하게 그렸더니 무엇이 빠졌는지가 묻혔다, 사용자 지적). 예전 그림은 잎만 한 타원을 엽록체라 불렀다.

import type { StepRenderer } from "../../types";
import { P, arrow, bad, bvBtn, chip, g5Lab, good, row, tag, tap, txt, type G5Step } from "./kit";
import { beam, f1, g5Layers, glucose, label, leafBlade, memo, mol, newNs, particleDefs, plantDefs, rng, rootStrand, sun, sunDefs, type Pt } from "./art";
import { chloroplast, elodeaField, lettuceField, microDefs, microscope, onionField, scopeOverlay } from "./microArt";

// ── 현미경 관찰 ─────────────────────────────────────────────────────
const CX = 112;
const CY = 118;
const R = 92;
const BOX: [number, number, number, number] = [CX - R, CY - R, CX + R, CY + R];

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
  const A = newNs("sc");
  const st = g5Layers(lab, "현미경으로 본 표본의 세포", ["defs", "view", "frame", "info"]);
  const fields = memo<string>();
  const seen = new Set<SpecKey>();
  let now: SpecKey | null = null;
  st.set("defs", `<defs>${microDefs(A)}<clipPath id="${A}clip"><circle cx="${CX}" cy="${CY}" r="${R}"/></clipPath><radialGradient id="${A}dark" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="#23365A"/><stop offset="1" stop-color="#121E33"/></radialGradient></defs>`);
  st.set(
    "frame",
    // 접안렌즈의 테(검은 띠와 금속 테, 위쪽의 빛 반사)
    `<circle cx="${CX}" cy="${CY}" r="${R + 2}" fill="none" stroke="#070D18" stroke-width="7"/><circle cx="${CX}" cy="${CY}" r="${R + 6}" fill="none" stroke="#46587A" stroke-width="2.4"/>` +
      `<path d="M${f1(CX - (R + 6) * Math.cos(0.5))} ${f1(CY - (R + 6) * Math.sin(0.5))} A${R + 6} ${R + 6} 0 0 1 ${f1(CX + (R + 6) * Math.cos(1.2))} ${f1(CY - (R + 6) * Math.sin(1.2))}" fill="none" stroke="#9DB3D6" stroke-width="1.4" opacity=".7"/>`,
  );

  const draw = (): void => {
    const sp = now ? SPEC[now] : null;
    if (now) {
      const k = now;
      const field = fields(k, () => (k === "elodea" ? elodeaField(A, BOX) : k === "lettuce" ? lettuceField(A, BOX) : onionField(A, BOX)));
      st.set("view", `<g clip-path="url(#${A}clip)"><g class="g2u5x-focus">${field}</g>${scopeOverlay(A, CX, CY, R, { px: 40, text: "40 μm" })}</g>`);
    } else st.set("view", `<circle cx="${CX}" cy="${CY}" r="${R}" fill="url(#${A}dark)"/>${txt(CX, CY - 4, "표본을 골라", { size: 13 })}${txt(CX, CY + 14, "현미경에 올려요", { size: 13 })}`);
    const row3 = (y: number, k: string, v: string, hot = false): string => txt(232, y, k, { anchor: "start", size: 12, fill: P.dim }) + txt(232, y + 18, v, { anchor: "start", size: 14, fill: hot ? P.leafHi : "#E8EEF9", weight: 800 });
    st.set("info", sp ? row3(58, "올린 표본", sp.name) + row3(108, "표본의 색", sp.color) + row3(158, "초록 알갱이", sp.grains, sp.grains === "가득") : microscope(288, 214, 1.1) + label(288, 50, "광학 현미경", { fill: P.dim, size: 12 }));
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

// 무대 배치: 왼쪽은 식물(흙 위 188), 오른쪽 원(가운데 IC, 반지름 IR)은 잎의 한 점을 크게 본 잎세포와 엽록체.
const GROUND = 188;
const IC: Pt = [262, 118];
const IR = 72;
const ZOOM: Pt = [134, 101]; // 잎에서 크게 본 자리
const CHL: Pt = [268, 112]; // 원 안의 엽록체 가운데
// 재료가 엽록체로 들어가는 길(꼬리 → 머리): 빛은 위 왼쪽에서, 물은 왼쪽(잎맥의 물관 쪽)에서, 이산화 탄소는 아래(기공으로 들어온 세포 사이 공기)에서
const IN_PATH: Record<Feed, [Pt, Pt]> = {
  light: [[232, 58], [250, 90]],
  water: [[198, 128], [222, 120]],
  co2: [[240, 178], [254, 140]],
};

/** 흙(알갱이와 틈). wet이면 알갱이 사이에 물이 있다. */
function soil(ns: string, wet: boolean): string {
  const r = rng(13);
  let s = `<rect x="0" y="${GROUND}" width="346" height="${230 - GROUND}" fill="${wet ? "#3A281C" : "#4E3B2C"}"/>`;
  s += `<path d="M0 ${GROUND} L346 ${GROUND}" stroke="${wet ? "#6B4A32" : "#7C6048"}" stroke-width="2"/>`;
  for (let i = 0; i < 36; i++) {
    const x = r() * 346;
    const y = GROUND + 4 + r() * (230 - GROUND - 4);
    const rx = 1.4 + r() * 2.4;
    s += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(rx)}" ry="${f1(rx * (0.6 + r() * 0.3))}" fill="${["#5E412D", "#6A4C35", "#523826"][i % 3]}" opacity=".7" transform="rotate(${Math.round(r() * 180)} ${f1(x)} ${f1(y)})"/>`;
  }
  if (wet)
    [[30, 204], [46, 218], [84, 208], [98, 222], [20, 224], [70, 226]].forEach(([x, y]) => {
      s += `<path d="M${x} ${y - 4.5} q3.2 4.2 3.2 6.2 a3.2 3.2 0 0 1 -6.4 0 q0 -2 3.2 -6.2 Z" fill="${P.water}" stroke="#1F5F9A" stroke-width=".7"/><circle cx="${x - 1}" cy="${y + 1}" r=".9" fill="#E6F4FF"/>`;
    });
  void ns;
  return s;
}

/** 왼쪽의 식물: 줄기, 잎 셋, 곁눈, 뿌리(뿌리털). water면 줄기의 물관(파랑 점선)이 흐른다. */
function plant(ns: string, water: boolean): string {
  let s = "";
  // 뿌리: 원뿌리와 곁뿌리, 끝 가까이에 뿌리털
  s += rootStrand(ns, [[64, GROUND - 2], [63, 200], [61, 212], [60, 228]], 4.6, { hairs: 16, seed: 3, hairLen: 5 });
  s += rootStrand(ns, [[63, 196], [52, 202], [40, 209], [28, 213]], 2.4, { hairs: 12, seed: 5, hairLen: 4 });
  s += rootStrand(ns, [[63, 199], [76, 205], [88, 212], [100, 216]], 2.4, { hairs: 12, seed: 7, hairLen: 4 });
  s += rootStrand(ns, [[61, 210], [50, 218], [42, 228]], 1.8, { hairs: 8, seed: 9, hairLen: 3.5 });
  // 줄기(아래가 굵다)
  const stem = `M60.6 ${GROUND} C60 160, 62 132, 64.6 104 C66 88, 67 78, 68.4 66 L71.6 66 C70.6 78, 70 88, 69 104 C67 132, 66.4 160, 67.4 ${GROUND} Z`;
  s += `<path d="${stem}" fill="url(#${ns}stem)" stroke="#1F4F1F" stroke-width=".8"/>`;
  if (water) s += `<path d="M64 ${GROUND + 2} C63.6 160, 64.6 132, 66.6 104 L${ZOOM[0] - 18} ${ZOOM[1] + 1}" stroke="${P.water}" stroke-width="1.6" fill="none" stroke-dasharray="3 3" class="g2u5x-dash"/>`;
  // 잎: 크게 볼 잎(오른쪽 위), 아래 왼쪽 잎, 꼭대기 어린잎 둘
  s += leafBlade(ns, 66.6, 104, -14, 78, 21, { pet: 10, seed: 3 });
  s += leafBlade(ns, 65, 138, 196, 52, 15, { pet: 7, seed: 5 });
  s += leafBlade(ns, 70, 70, -62, 30, 9, { pet: 4, seed: 8 });
  s += leafBlade(ns, 69.4, 74, 232, 26, 8, { pet: 4, seed: 9 });
  s += `<ellipse cx="70.2" cy="64" rx="3.2" ry="4.6" fill="#7CC26C" stroke="#2F6F2F" stroke-width=".7"/>`;
  return s;
}

export const g2u5SupplyLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G5Step;
  const lab = g5Lab(host, api, s, { steps: 3, cls: "g2u5x-supply", wait: "세 가지를 주고 끊어 보세요" });
  const { f, tm } = lab;
  const A = newNs("sp");
  const st = g5Layers(lab, "빛, 이산화 탄소, 물을 받는 식물과 잎세포 속의 엽록체", ["defs", "scene", "cell", "fx", "tag"]);
  const art = memo<string>();
  const on: Record<Feed, boolean> = { light: false, co2: false, water: false };
  let ran = false; // 셋 다 주어 만들어지는 것을 봤다
  let cut = false; // 그 뒤 하나를 끊어 멈추는 것을 봤다
  st.set(
    "defs",
    `<defs>${particleDefs(A)}${plantDefs(A)}${sunDefs(A)}${microDefs(A)}<clipPath id="${A}in"><circle cx="${IC[0]}" cy="${IC[1]}" r="${IR}"/></clipPath>` +
      `<radialGradient id="${A}cyto" cx=".45" cy=".4" r=".75"><stop offset="0" stop-color="#E3F3CF"/><stop offset="1" stop-color="#B9DDA0"/></radialGradient></defs>`,
  );

  const running = (): boolean => on.light && on.co2 && on.water;
  const lacks = (): Feed[] => (Object.keys(on) as Feed[]).filter((k) => !on[k]);

  /** 원 안의 바탕: 잎세포의 한 부분(세포벽, 세포질, 액포의 가장자리)과 엽록체(속 구조는 옅게). 빛이 없으면 원 전체가 어둡다(엽록체의 색은 그대로). */
  const cellView = (dark: boolean): string =>
    art(`cell${dark}`, () => {
      let c = `<g clip-path="url(#${A}in)"><rect x="${IC[0] - IR}" y="${IC[1] - IR}" width="${IR * 2}" height="${IR * 2}" fill="url(#${A}cyto)"/>`;
      c += `<path d="M${IC[0] - IR} ${IC[1] - 30} C${IC[0] - 40} ${IC[1] - 50}, ${IC[0] - 20} ${IC[1] - 66}, ${IC[0] - 8} ${IC[1] - IR}" fill="none" stroke="#7FB06A" stroke-width="7"/><path d="M${IC[0] - IR} ${IC[1] - 30} C${IC[0] - 40} ${IC[1] - 50}, ${IC[0] - 20} ${IC[1] - 66}, ${IC[0] - 8} ${IC[1] - IR}" fill="none" stroke="#E9F6DA" stroke-width="1.4"/>`;
      c += `<path d="M${IC[0] + 24} ${IC[1] + IR} C${IC[0] + 34} ${IC[1] + 50}, ${IC[0] + 54} ${IC[1] + 40}, ${IC[0] + IR} ${IC[1] + 34}" fill="#D9EEF3" stroke="#8DB7B0" stroke-width="1" opacity=".9"/>`;
      c += chloroplast(A, CHL[0], CHL[1], 96, 48, { rot: -10, seed: 7, starch: 2, soft: true });
      if (dark) c += `<rect x="${IC[0] - IR}" y="${IC[1] - IR}" width="${IR * 2}" height="${IR * 2}" fill="#050B16" opacity=".5"/>`;
      c += `</g>`;
      return c;
    });

  /** 재료 하나가 엽록체로 들어가는 길. 주면 그 색의 굵은 화살과 흘러 들어가는 입자, 끊으면 회색 점선 화살과 빈 자리(동그라미). */
  const feedPath = (k: Feed): string => {
    const [t, h] = IN_PATH[k];
    if (!on[k]) {
      const a = Math.atan2(h[1] - t[1], h[0] - t[0]);
      const hx = (d: number): string => `${f1(h[0] - Math.cos(a) * 8 + Math.cos(a + Math.PI / 2) * 5 * d)},${f1(h[1] - Math.sin(a) * 8 + Math.sin(a + Math.PI / 2) * 5 * d)}`;
      return `<path d="M${f1(t[0])} ${f1(t[1])} L${f1(h[0] - Math.cos(a) * 6)} ${f1(h[1] - Math.sin(a) * 6)}" stroke="#7F93B2" stroke-width="2" stroke-dasharray="3 3" fill="none"/><polyline points="${hx(1)} ${f1(h[0])},${f1(h[1])} ${hx(-1)}" fill="none" stroke="#7F93B2" stroke-width="2"/><circle cx="${f1(t[0])}" cy="${f1(t[1])}" r="7" fill="rgba(11,21,36,.35)" stroke="#7F93B2" stroke-width="1.4" stroke-dasharray="2.5 2"/>`;
    }
    const color = k === "light" ? P.energy : k === "water" ? P.water : P.co2;
    // 밝은 세포질 위에서도 보이게 짙은 테를 먼저 깐다
    let s = `<g opacity=".45">${arrow(t[0], t[1], h[0], h[1], "#0B1524", 5.4)}</g>` + arrow(t[0], t[1], h[0], h[1], color, 3);
    if (k === "light") s = beam(A, [t[0] - 6, t[1] - 8], h, 12, { cls: "g2u5x-flow" }) + s;
    else {
      const dx = f1(t[0] - h[0]);
      const dy = f1(t[1] - h[1]);
      [0, 0.6, 1.2].forEach((d) => (s += `<g class="g2u5x-mv" style="--dx:${dx}px;--dy:${dy}px;animation-delay:-${d}s">${mol(A, k === "water" ? "h2o" : "co2", h[0], h[1], 0.9, { rot: k === "co2" ? -60 : 0 })}</g>`));
    }
    return s;
  };

  const draw = (): void => {
    const run = running();
    const lk = lacks();
    // 식물과 흙, 해, 크게 보기 선(움직이지 않는 그림)
    st.set(
      "scene",
      art(`scene${on.light}${on.water}`, () => {
        let sc = soil(A, on.water) + plant(A, on.water);
        sc += sun(A, 28, 30, 12, on.light);
        if (on.light) sc += beam(A, [42, 42], [124, 90], 10, { cls: "g2u5x-flow" }) + beam(A, [40, 50], [106, 104], 8, { cls: "g2u5x-flow" });
        // 크게 보기: 잎 위의 네모와 원으로 이어지는 점선
        sc += `<rect x="${ZOOM[0] - 4}" y="${ZOOM[1] - 4}" width="8" height="8" fill="none" stroke="#9CC2FF" stroke-width="1.2"/>`;
        sc += `<path d="M${ZOOM[0] + 4} ${ZOOM[1] - 4} L${f1(IC[0] - IR * 0.5)} ${f1(IC[1] - IR * 0.87)} M${ZOOM[0] + 4} ${ZOOM[1] + 4} L${f1(IC[0] - IR * 0.5)} ${f1(IC[1] + IR * 0.87)}" stroke="#9CC2FF" stroke-width="1" stroke-dasharray="3 3" opacity=".7"/>`;
        sc += label(28, 60, "빛", { fill: on.light ? P.energy : P.dim });
        sc += label(18, 182, "물", { fill: on.water ? P.water : P.dim, anchor: "start" });
        return sc;
      }),
    );
    // 원 안의 잎세포와 엽록체
    st.set("cell", cellView(!on.light) + `<circle cx="${IC[0]}" cy="${IC[1]}" r="${IR}" fill="none" stroke="#9CC2FF" stroke-width="1.6"/>`);
    // 재료 셋이 엽록체로 들어가는 길(원 안), 이산화 탄소가 잎 아랫면으로 들어오는 모습(원 밖), 만들어진 것
    let inner = (["light", "water", "co2"] as Feed[]).map(feedPath).join("");
    let fx = "";
    if (on.co2) [[116, 134], [134, 146], [150, 130]].forEach(([x, y], i) => (fx += `<g class="g2u5x-mv" style="--dx:0px;--dy:14px;animation-delay:-${i * 0.6}s">${mol(A, "co2", x, y, 0.8, { rot: i * 30 - 20 })}</g>`));
    fx += label(124, 174, "이산화 탄소", { fill: on.co2 ? P.co2 : P.dim, size: 12 });
    if (run) {
      [[-18, 0], [2, 8], [22, -2]].forEach(([dx, dy], i) => (inner += glucose(A, CHL[0] + dx, CHL[1] + dy, 7, { cls: "g2u5x-pop", style: `animation-delay:${i * 0.35}s` })));
      // 산소: 엽록체에서 나와 세포 밖으로(기공을 지나 잎 밖으로 나간다)
      [0, 0.6, 1.2].forEach((d, i) => (fx += `<g class="g2u5x-mv out" style="--dx:30px;--dy:-30px;animation-delay:-${d}s">${mol(A, "o2", CHL[0] + 32 + i * 5, CHL[1] - 28 - i * 5, 1)}</g>`));
      fx += label(318, 40, "산소", { fill: P.o2 });
      fx += label(CHL[0] + 2, CHL[1] + 30, "포도당", { fill: P.sugar, size: 12.5 });
    } else fx += label(CHL[0] + 2, CHL[1] + 30, "엽록체", { fill: "#CFF5D6", size: 12.5 });
    st.set("fx", `<g clip-path="url(#${A}in)">${inner}</g>${fx}`);
    st.set("tag", run ? tag(158, 22, "양분을 만드는 중", { fill: P.leafHi }) : tag(158, 22, lk.length === 3 ? "아무것도 주지 않았어요" : `멈춤: ${FEED[lk[0]].lack}`, { fill: P.bad }));
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
