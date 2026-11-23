// [중2 Ⅴ v5] g2u5l6 양분의 이동 랩: 「잎의 양분은 어떻게 다른 곳으로 갈까요?」
// 본문과 탐구(광합성산물의 생성, 이동, 저장, 이용을 모형으로 나타내기)를 손으로 한다.
// 학생이 정하는 것: 보낼 형태(녹말 그대로, 설탕으로 바꿔서)와 통로(물관, 체관), 그리고 보낼 곳(새순, 꽃, 뿌리).
// 실패하는 길: 녹말 그대로는 물에 녹지 않아 잎을 떠나지 못한다. 물관은 뿌리에서 올라오는 물의 길이라 양분이 실리지 않는다.
// 성공하면 설탕이 체관을 따라 위(새순, 꽃)로도 아래(뿌리)로도 간다. 도착한 곳마다 쓰임이 보인다.
// 판정: 양분이 이동할 때의 형태와 통로. 결론: 녹말은 설탕으로 바뀌어 체관을 따라 필요한 곳으로 이동한다.
// 그림(2026-11-15 다시 그림, 같은 날 손봄): 학생이 고르는 두 관이 주인공이다. 굵은 줄기의 왼쪽에 창을 내어 관 둘만 크게 보인다:
// 바깥쪽(줄기 겉에 가까운 쪽) 체관은 앰버, 안쪽(줄기 가운데 쪽) 물관은 파랑(쌍떡잎식물 줄기에서 물관이 안쪽, 체관이 바깥쪽). 물은 늘 물관을 따라 올라간다.
// 한때 줄기의 세로 단면을 여러 겹(표피, 겉질, 형성층, 고갱이)으로 가늘게 그리고 가로 단면 원을 곁들였으나, 고를 관이 가늘어 요점이 묻혀(사용자 지적) 두 관만 남겼다.
// 잎의 녹말은 포도당 고리가 이어진 사슬(남보라), 설탕은 고리 둘(앰버)로 그림과 같은 기호를 쓴다.

import type { StepRenderer } from "../../types";
import { P, bad, bvBtn, bvTween, chip, g5Lab, good, row, tag, tap, toast, type G5Step } from "./kit";
import { f1, g5Layers, label, leafBlade, memo, newNs, particleDefs, plantDefs, rng, rootStrand, starchChain, sucrose, type Pt } from "./art";

type Dest = "shoot" | "flower" | "root";
// 줄기: 가운데 SX, 폭 30(SX-15~SX+15), 꼭대기 TOP, 땅 GROUND. 왼쪽 창 안에 체관(가운데 PHL)과 물관(가운데 XYL).
const SX = 170;
const TOP = 48;
const GROUND = 178;
const PHL = 162.2;
const XYL = 171.3;
const NODE_LEAF = 121; // 잎이 붙은 마디
const NODE_FLOWER = 80; // 꽃가지가 붙은 마디
const LEAF: Pt = [96, 124]; // 잎 속 설탕이 출발하는 곳
const DEST: Record<Dest, { name: string; path: Pt[]; say: string; note: string }> = {
  shoot: { name: "새순", path: [LEAF, [146, NODE_LEAF], [PHL, NODE_LEAF - 1], [PHL, TOP + 8], [SX, TOP]], say: "<b>새순</b>으로 이동한 양분은 새로운 잎과 줄기가 자라는 데 쓰여요.", note: "자라는 데 씀" },
  flower: { name: "꽃", path: [LEAF, [146, NODE_LEAF], [PHL, NODE_LEAF - 1], [PHL, NODE_FLOWER + 2], [154, NODE_FLOWER], [128, 63], [116, 55]], say: "<b>꽃</b>으로 이동한 양분은 꽃을 피우고 열매를 맺는 데 쓰여요.", note: "꽃 피우는 데 씀" },
  root: { name: "뿌리", path: [LEAF, [146, NODE_LEAF], [PHL, NODE_LEAF - 1], [PHL, GROUND + 2], [168, 196], [169, 208]], say: "쓰고 남은 양분은 <b>뿌리</b> 등으로 이동해 다시 <b>녹말</b> 등으로 바뀌어 저장돼요.", note: "녹말로 저장" },
};
// 잎 속의 녹말(또는 설탕) 자리
const GRAINS: Pt[] = [[68, 117], [96, 129], [120, 114], [80, 137], [124, 131]];

export const g2u5RouteLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G5Step;
  const lab = g5Lab(host, api, s, { steps: 3, cls: "g2u5x-route", wait: "양분의 형태와 이동 통로를 골라 보내 보세요", tall: true });
  const { f, tm } = lab;
  const A = newNs("rt");
  const ly = g5Layers(lab, "잎, 줄기 속의 물관과 체관, 새순과 꽃과 뿌리가 있는 식물", ["defs", "plant", "parts", "load", "notes", "dot"]);
  const art = memo<string>();
  ly.set(
    "defs",
    `<defs>${particleDefs(A)}${plantDefs(A)}<linearGradient id="${A}phl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#D49A2E"/><stop offset=".5" stop-color="#F6D27A"/><stop offset="1" stop-color="#D49A2E"/></linearGradient>` +
      `<linearGradient id="${A}xyl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3F86CC"/><stop offset=".5" stop-color="#A9D4F7"/><stop offset="1" stop-color="#3F86CC"/></linearGradient>` +
      `<radialGradient id="${A}petal" cx=".5" cy=".9" r=".9"><stop offset="0" stop-color="#FFE3EC"/><stop offset=".6" stop-color="#FFB3C7"/><stop offset="1" stop-color="#E5779A"/></radialGradient></defs>`,
  );
  let form: "starch" | "sugar" | null = null;
  let tube: "xylem" | "phloem" | null = null;
  let open = false; // 설탕과 체관으로 길이 열렸다
  let fail: "starch" | "xylem" | "" = "";
  const got = new Set<Dest>();
  let dot: [number, number] | null = null;
  let busy = false;

  /** 흙, 굵은 줄기와 그 왼쪽 창 속의 두 관(물은 물관을 따라 늘 위로), 뿌리, 꽃가지, 잎. */
  const plantBase = (): string => {
    const r = rng(17);
    let p = `<rect x="0" y="${GROUND}" width="346" height="${230 - GROUND}" fill="#3A281C"/><line x1="0" y1="${GROUND}" x2="346" y2="${GROUND}" stroke="#6B4A32" stroke-width="2"/>`;
    for (let i = 0; i < 40; i++) {
      const x = r() * 346;
      const y = GROUND + 5 + r() * (230 - GROUND - 5);
      const rr = 1.2 + r() * 2.2;
      p += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(rr)}" ry="${f1(rr * 0.7)}" fill="${["#5A3E2B", "#664630", "#4E3626"][i % 3]}" opacity=".8"/>`;
    }
    // 뿌리(원뿌리, 곁뿌리, 뿌리털)
    p += rootStrand(A, [[SX, GROUND - 2], [SX - 1, 196], [SX - 3, 212], [SX - 2, 230]], 9, { hairs: 18, seed: 3, hairLen: 5 });
    p += rootStrand(A, [[SX - 2, 190], [SX - 20, 198], [SX - 38, 206], [SX - 54, 210]], 3, { hairs: 12, seed: 5, hairLen: 4 });
    p += rootStrand(A, [[SX + 1, 194], [SX + 20, 202], [SX + 40, 210], [SX + 56, 214]], 3, { hairs: 12, seed: 7, hairLen: 4 });
    // 꽃가지(잎 위 마디에서 왼쪽 위로), 속에 체관이 이어진다
    const br = `M${SX - 15} ${NODE_FLOWER} C${SX - 26} ${NODE_FLOWER - 6}, ${SX - 38} ${NODE_FLOWER - 14}, 120 59`;
    p += `<path d="${br}" stroke="#2F6F2F" stroke-width="5.6" fill="none" stroke-linecap="round"/><path d="${br}" stroke="#5FA84E" stroke-width="3.8" fill="none" stroke-linecap="round"/><path d="${br}" stroke="#F0C060" stroke-width="1.1" fill="none"/>`;
    // 줄기: 둥근 기둥(음영)과 왼쪽의 창
    p += `<path d="M${SX - 15} ${GROUND} C${SX - 15} 140, ${SX - 14} 90, ${SX - 13} ${TOP + 8} Q${SX - 12} ${TOP - 2} ${SX} ${TOP - 4} Q${SX + 12} ${TOP - 2} ${SX + 13} ${TOP + 8} C${SX + 14} 90, ${SX + 15} 140, ${SX + 15} ${GROUND} Z" fill="url(#${A}stem)" stroke="#1F4F1F" stroke-width="1"/>`;
    const wy0 = TOP + 10;
    const wy1 = GROUND - 4;
    p += `<rect x="${SX - 12.5}" y="${wy0}" width="19" height="${wy1 - wy0}" rx="3" fill="#E4F1D6" stroke="#2F6F2F" stroke-width=".9"/>`;
    // 체관(바깥쪽): 칸칸이 체판
    p += `<rect x="${f1(PHL - 3.8)}" y="${wy0 + 1}" width="7.6" height="${wy1 - wy0 - 2}" rx="2" fill="url(#${A}phl)" stroke="#9A6A14" stroke-width=".7"/>`;
    for (let y = wy0 + 9; y < wy1 - 2; y += 11) p += `<line x1="${f1(PHL - 3.8)}" y1="${y}" x2="${f1(PHL + 3.8)}" y2="${y}" stroke="#9A6A14" stroke-width=".8"/>`;
    // 물관(안쪽): 고리 무늬와 늘 올라가는 물
    p += `<rect x="${f1(XYL - 3.8)}" y="${wy0 + 1}" width="7.6" height="${wy1 - wy0 - 2}" rx="2" fill="url(#${A}xyl)" stroke="#2F6FA8" stroke-width=".7"/>`;
    for (let y = wy0 + 4; y < wy1 - 2; y += 3.4) p += `<line x1="${f1(XYL - 3.6)}" y1="${f1(y + 1.2)}" x2="${f1(XYL + 3.6)}" y2="${f1(y)}" stroke="#2F6FA8" stroke-width=".6" opacity=".8"/>`;
    p += `<path d="M${XYL} ${wy1} L${XYL} ${wy0}" stroke="#E8F4FF" stroke-width="2" stroke-dasharray="3 6" class="g2u5x-dash"/>`;
    // 잎(잎자루가 마디에서 왼쪽으로), 가운데 맥 속의 체관이 줄기의 체관으로 이어진다
    p += leafBlade(A, SX - 15, NODE_LEAF, 184, 104, 30, { pet: 10, seed: 6, veinOp: 0.8 });
    p += `<path d="M${LEAF[0]} ${LEAF[1]} L146 ${NODE_LEAF} L${PHL} ${NODE_LEAF - 1}" stroke="#F0C060" stroke-width="1.4" fill="none" opacity=".9"/>`;
    // 관 이름: 체관은 왼쪽 아래(바깥쪽, 잎 밑), 물관은 오른쪽(안쪽)에서 짧은 지시선으로. 잎보다 나중에 그려 가리지 않게.
    p += `<path d="M${f1(PHL - 3.8)} 158 L146 164" stroke="#F3D78C" stroke-width="1.1"/>` + label(144, 170, "체관", { anchor: "end", size: 12.5, fill: "#F6D27A" });
    p += `<path d="M${f1(XYL + 4)} 99 L${SX + 22} 99" stroke="#9AC8F2" stroke-width="1.1"/>` + label(SX + 24, 103, "물관", { anchor: "start", size: 12.5, fill: "#9AC8F2" });
    return p;
  };
  ly.set("plant", plantBase());

  /** 도착하면 바뀌는 곳: 새순(어린잎이 자란다), 꽃(봉오리가 핀다), 뿌리(녹말이 쌓인다). */
  const parts = (): string => {
    const k = (d: Dest): number => (got.has(d) ? 1 : 0);
    let p = "";
    // 설탕이 닿은 곳은 둘레가 환해진다(어디에 닿았는지가 먼저 보이게)
    const glow = (x: number, y: number, r: number): string => `<circle cx="${x}" cy="${y}" r="${r}" fill="${P.leafHi}" opacity=".16"/><circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${P.leafHi}" stroke-width="1.4" stroke-dasharray="3 3" opacity=".8"/>`;
    if (got.has("shoot")) p += glow(SX, TOP - 12, 22);
    if (got.has("flower")) p += glow(114, 53, 24);
    if (got.has("root")) p += glow(SX - 4, 206, 20);
    // 새순: 꼭대기의 눈과 어린잎 둘(설탕이 닿으면 크게 자란다)
    const sz = 1 + k("shoot") * 0.8;
    p += leafBlade(A, SX - 1, TOP - 2, -128, 15 * sz, 5.5 * sz, { pet: 2, seed: 2, teeth: 6 }) + leafBlade(A, SX + 1, TOP - 2, -52, 15 * sz, 5.5 * sz, { pet: 2, seed: 4, teeth: 6 });
    p += `<ellipse cx="${SX}" cy="${TOP - 5}" rx="3.8" ry="5.8" fill="#86D68F" stroke="#2F6F2F" stroke-width=".8"/>`;
    // 꽃: 봉오리(꽃받침이 감싼 분홍 끝) 또는 핀 꽃(꽃잎 다섯, 수술)
    if (got.has("flower")) {
      for (let i = 0; i < 5; i++) {
        const a = i * 72 - 90;
        p += `<g transform="translate(114 53) rotate(${a + 90})"><path d="M0 0 C-9 -3, -10 -17, 0 -21 C10 -17, 9 -3, 0 0 Z" fill="url(#${A}petal)" stroke="#C4587A" stroke-width=".8"/><path d="M0 -2 L0 -13" stroke="#E5779A" stroke-width=".6" opacity=".7"/></g>`;
      }
      p += `<circle cx="114" cy="53" r="5" fill="#FFD43B" stroke="#B8860B" stroke-width=".8"/>`;
      for (let i = 0; i < 8; i++) p += `<circle cx="${f1(114 + Math.cos(i * 0.785) * 3.2)}" cy="${f1(53 + Math.sin(i * 0.785) * 3.2)}" r="1" fill="#E69500"/>`;
    } else {
      p += `<g transform="translate(118 58) rotate(-56)"><path d="M0 0 C-5 -4, -5 -15, 0 -19 C5 -15, 5 -4, 0 0 Z" fill="#F5A6BC" stroke="#C4587A" stroke-width=".8"/><path d="M0 0 C-7 -3, -7 -10, -3 -13 L0 -6 L3 -13 C7 -10, 7 -3, 0 0 Z" fill="#5FA84E" stroke="#2F6F2F" stroke-width=".8"/></g>`;
    }
    // 뿌리에 쌓인 녹말(설탕이 도착하면)
    if (got.has("root")) p += starchChain(A, SX - 1, 202, 3, 3.1, { rot: 90, cls: "g2u5x-pop" }) + starchChain(A, SX - 11, 214, 2, 2.8, { rot: 60, cls: "g2u5x-pop" });
    // 흐린 이름표
    p += label(86, 64, "꽃", { size: 12, fill: P.dim, anchor: "end" }) + label(SX + 22, 50, "새순", { size: 12, fill: P.dim, anchor: "start" }) + label(SX + 30, 226, "뿌리", { size: 12, fill: P.dim, anchor: "start" });
    return p;
  };

  const draw = (): void => {
    const sugar = open || fail === "xylem";
    ly.set("parts", art([...got].sort().join(","), parts));
    // 잎 속의 녹말 사슬, 또는 바뀐 설탕
    let load = GRAINS.map(([x, y], i) => (sugar ? sucrose(A, x, y, 4.4, { rot: i * 25 }) : starchChain(A, x, y, 4, 3.6, { rot: i * 30 - 20, cls: fail === "starch" ? "g2u5x-shake" : "", style: `animation-delay:${i * 0.05}s` }))).join("");
    load += label(78, 168, sugar ? "잎의 설탕" : "잎의 녹말", { size: 12.5, fill: sugar ? P.sugar : "#A9B0FF" });
    if (open) load += `<path d="M${PHL} ${GROUND - 4} L${PHL} ${TOP + 10}" stroke="#FFF3D0" stroke-width="1.6" stroke-dasharray="2 5" opacity=".9"/>`;
    if (fail === "xylem") load += `<g class="g2u5x-shake">${sucrose(A, XYL, NODE_LEAF, 5)}</g>`;
    ly.set("load", load);
    ly.set(
      "notes",
      (Object.keys(DEST) as Dest[])
        .filter((d) => got.has(d))
        .map((d) => tag(d === "shoot" ? 258 : d === "flower" ? 64 : 268, d === "shoot" ? 34 : d === "flower" ? 22 : 206, DEST[d].note, { size: 12, fill: P.leafHi }))
        .join(""),
    );
    ly.set("dot", dot ? sucrose(A, dot[0], dot[1], 5.6) : "");
    host.dataset.g5Open = open ? "1" : "0";
    host.dataset.g5Fail = fail;
    host.dataset.g5Got = String(got.size);
  };

  // 1단계: 형태와 통로를 정해 내보낸다
  const cStarch = chip("starch", "녹말 상태 그대로", "", () => pickForm("starch"));
  const cSugar = chip("sugar", "설탕으로 바꿔서", "", () => pickForm("sugar"));
  const cXylem = chip("xylem", "물관으로 보내기", "", () => pickTube("xylem"));
  const cPhloem = chip("phloem", "체관으로 보내기", "", () => pickTube("phloem"));
  const pickForm = (v: "starch" | "sugar"): void => {
    if (busy) return;
    tap();
    form = v;
    fail = "";
    cStarch.on(v === "starch");
    cSugar.on(v === "sugar");
    draw();
  };
  const pickTube = (v: "xylem" | "phloem"): void => {
    if (busy) return;
    tap();
    tube = v;
    fail = "";
    cXylem.on(v === "xylem");
    cPhloem.on(v === "phloem");
    draw();
  };
  const send = bvBtn("main g2u5x-send", "선택한 방법으로 양분 내보내기");
  send.addEventListener("click", () => {
    if (busy) return;
    if (!form || !tube) {
      tap();
      f.say("양분을 <b>어떤 형태로 바꿀지</b>와 <b>어느 관으로 보낼지</b>를 하나씩 골라 주세요.");
      return;
    }
    if (form === "starch") {
      bad();
      lab.slip();
      fail = "starch";
      draw();
      toast(lab, "녹말은 물에 녹지 않아 이동할 수 없어요", true);
      f.say("녹말은 물에 녹지 않아서 관을 따라 흘러갈 수 없어요. 물에 잘 녹는 <b>설탕으로 바꿔서</b> 보내 보세요.");
      return;
    }
    if (tube === "xylem") {
      bad();
      lab.slip();
      fail = "xylem";
      draw();
      toast(lab, "물관은 뿌리에서 흡수한 물이 올라오는 통로예요", true);
      f.say("물관은 뿌리에서 흡수한 물이 잎으로 올라오는 통로예요. 양분이 이동하는 통로인 <b>체관</b>을 골라 보세요.");
      return;
    }
    good();
    fail = "";
    open = true;
    f.pips(1);
    draw();
    f.slot.setControls(row(...dests.map((c) => c.el)), go);
    f.say("잎의 녹말이 물에 잘 녹는 <b>설탕</b>으로 바뀌어 <b>체관</b>으로 들어갔어요! 이제 아래 버튼을 눌러 세 곳으로 양분을 보내 보세요.");
  });

  // 2단계: 보낼 곳
  const dests = (Object.keys(DEST) as Dest[]).map((d) =>
    chip(d, DEST[d].name, "양분 보내기", () => {
      if (busy || got.has(d)) return;
      busy = true;
      tap();
      const pts = DEST[d].path;
      const lens = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
      const total = lens.reduce((a, b) => a + b, 0);
      bvTween(tm, 1100, (t) => {
        let left = t * total;
        let i = 0;
        while (i < lens.length - 1 && left > lens[i]) left -= lens[i++];
        const r = lens[i] ? left / lens[i] : 0;
        dot = [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * r, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * r];
        draw();
      }, () => {
        dot = null;
        busy = false;
        got.add(d);
        const mine = dests.find((c) => c.el.dataset.k === d);
        mine?.done();
        mine?.sub(DEST[d].note);
        good();
        draw();
        f.say(DEST[d].say);
        if (got.size === 3) {
          f.pips(2);
          go.disabled = false;
        }
      });
    }),
  );
  const go = bvBtn("main g2u5x-go", "양분이 이동한 과정 정리하기");
  go.disabled = true;
  go.addEventListener("click", () => {
    tap();
    // 보기 셋은 '…을 따라 이동했다'를 '…으로 이동했다'로 줄였다(정답 글이 오답 카드 한 줄 폭 270px을 넘으면 판정 칸 208px을 넘친다)
    lab.judge("잎에 있던 녹말은 어떤 형태로 바뀌어 어느 통로를 따라 이동했나요?", [{ t: "물에 녹는 설탕으로 바뀌어 체관으로 이동했다", ok: true }, { t: "녹말 상태 그대로 체관으로 이동했다" }, { t: "물에 녹는 설탕으로 바뀌어 물관으로 이동했다" }], "녹말은 물에 녹지 않으므로 물에 잘 녹는 <b>설탕</b>으로 바뀐 뒤, 양분 이동 통로인 <b>체관</b>을 따라 이동해요.", () =>
      lab.finish("잎에서 광합성으로 만든 양분(녹말)은 주로 밤에 물에 잘 녹는 <b>설탕</b>으로 바뀌어 <b>체관</b>을 따라 식물의 각 부분으로 이동해요. 새순과 꽃이 있는 위로도, 뿌리가 있는 아래로도 가서 쓰이거나 저장돼요."),
    );
  });

  f.slot.setControls(row(cStarch.el, cSugar.el), row(cXylem.el, cPhloem.el), send);
  draw();
  f.say("낮 동안 광합성을 한 잎에 <b>녹말</b>이 쌓여 있어요. 밤에 이 양분을 어떤 형태로 바꾸어 어느 관으로 내보내야 할까요?");
  return lab.cleanup;
};
