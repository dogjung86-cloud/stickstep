// [중2 Ⅴ v5] g2u5l6 양분의 이동 랩: 「잎의 양분은 어떻게 다른 곳으로 갈까요?」
// 책의 본문과 탐구(광합성산물의 생성, 이동, 저장, 이용을 모형으로 나타내기)를 손으로 한다.
// 학생이 정하는 것: 보낼 형태(녹말 그대로, 설탕으로 바꿔서)와 통로(물관, 체관), 그리고 보낼 곳(새순, 꽃, 뿌리).
// 실패하는 길: 녹말 그대로는 물에 녹지 않아 잎을 떠나지 못한다. 물관은 뿌리에서 올라오는 물의 길이라 양분이 실리지 않는다.
// 성공하면 설탕이 체관을 따라 위(새순, 꽃)로도 아래(뿌리)로도 간다. 도착한 곳마다 쓰임이 보인다.
// 판정: 양분이 이동할 때의 형태와 통로. 결론: 녹말은 설탕으로 바뀌어 체관을 따라 필요한 곳으로 이동한다.
// 그림(2026-11-15 다시 그림): 줄기를 세로로 가른 면에 바깥부터 표피, 겉질, 체관(앰버), 형성층, 물관(파랑), 가운데 고갱이를 그린다(물관이 안쪽, 체관이 바깥쪽).
// 물은 늘 물관을 따라 올라간다(파란 점선이 움직인다). 오른쪽 원은 줄기를 가로로 자른 면(관다발이 고리로 늘어선 쌍떡잎식물의 줄기).
// 잎의 녹말은 포도당 고리가 이어진 사슬(남보라), 설탕은 고리 둘(앰버)로 책의 그림 Ⅴ-5와 같은 기호를 쓴다.

import type { StepRenderer } from "../../types";
import { P, bad, bvBtn, bvTween, chip, g5Lab, good, row, tag, tap, toast, type G5Step } from "./kit";
import { f1, g5Layers, label, leafBlade, memo, newNs, particleDefs, plantDefs, rng, rootStrand, starchChain, sucrose, type Pt } from "./art";
import { stemSection } from "./microArt";

type Dest = "shoot" | "flower" | "root";
// 줄기: 가운데 x 150, 폭 24(138~162), 꼭대기 46, 땅 178. 왼쪽 체관의 가운데 x 143(설탕이 지나는 길).
const SX = 150;
const TOP = 46;
const GROUND = 178;
const PHL = 143;
const LEAF: Pt = [74, 124]; // 잎 속 설탕이 출발하는 곳
const DEST: Record<Dest, { name: string; path: Pt[]; say: string; note: string }> = {
  shoot: { name: "새순", path: [LEAF, [128, 121], [PHL, 119], [PHL, 56], [SX, 48]], say: "설탕이 <b>위쪽</b> 새순에 닿았어요. 새순이 자라는 데 쓰여요.", note: "자라는 데 씀" },
  flower: { name: "꽃", path: [LEAF, [128, 121], [PHL, 119], [PHL, 82], [138, 79], [110, 62], [100, 56]], say: "설탕이 꽃봉오리에 닿았어요. <b>꽃을 피우는 데</b> 쓰여요.", note: "꽃 피우는 데 씀" },
  root: { name: "뿌리", path: [LEAF, [128, 121], [PHL, 119], [PHL, GROUND], [147, 196], [148, 208]], say: "설탕이 <b>아래쪽</b> 뿌리에 닿았어요. 녹말로 바뀌어 저장돼요.", note: "녹말로 저장" },
};
// 잎 속의 녹말(또는 설탕) 자리
const GRAINS: Pt[] = [[52, 117], [80, 129], [100, 114], [64, 136], [110, 128]];

export const g2u5RouteLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G5Step;
  const lab = g5Lab(host, api, s, { steps: 3, cls: "g2u5x-route", wait: "양분을 보낼 방법을 정해 보세요" });
  const { f, tm } = lab;
  const A = newNs("rt");
  const ly = g5Layers(lab, "잎, 줄기 속의 물관과 체관, 새순과 꽃과 뿌리가 있는 식물과 줄기의 단면", ["defs", "plant", "parts", "inset", "load", "notes", "dot"]);
  const art = memo<string>();
  ly.set(
    "defs",
    `<defs>${particleDefs(A)}${plantDefs(A)}<linearGradient id="${A}phl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#D9A845"/><stop offset=".5" stop-color="#F3D27A"/><stop offset="1" stop-color="#D9A845"/></linearGradient>` +
      `<linearGradient id="${A}xyl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5B9AD6"/><stop offset=".5" stop-color="#A9D4F7"/><stop offset="1" stop-color="#5B9AD6"/></linearGradient>` +
      `<radialGradient id="${A}petal" cx=".5" cy=".9" r=".9"><stop offset="0" stop-color="#FFE3EC"/><stop offset=".6" stop-color="#FFB3C7"/><stop offset="1" stop-color="#E5779A"/></radialGradient>` +
      `<clipPath id="${A}in"><circle cx="298" cy="138" r="30"/></clipPath></defs>`,
  );
  let form: "starch" | "sugar" | null = null;
  let tube: "xylem" | "phloem" | null = null;
  let open = false; // 설탕과 체관으로 길이 열렸다
  let fail: "starch" | "xylem" | "" = "";
  const got = new Set<Dest>();
  let dot: [number, number] | null = null;
  let busy = false;

  /** 흙과 세로로 가른 줄기(물관은 늘 물이 올라간다). 잎과 꽃가지의 바탕. */
  const plantBase = (): string => {
    const r = rng(17);
    let p = `<rect x="0" y="${GROUND}" width="346" height="${230 - GROUND}" fill="#3A281C"/><line x1="0" y1="${GROUND}" x2="346" y2="${GROUND}" stroke="#6B4A32" stroke-width="2"/>`;
    for (let i = 0; i < 46; i++) {
      const x = r() * 346;
      const y = GROUND + 5 + r() * (230 - GROUND - 5);
      const rr = 1.2 + r() * 2.4;
      p += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(rr)}" ry="${f1(rr * 0.7)}" fill="${["#6B4A32", "#7C5A3E", "#5A3E2B"][i % 3]}" opacity=".8"/>`;
    }
    // 줄기의 세로 단면: 바깥(표피, 겉질) → 체관 → 형성층 → 물관 → 가운데 고갱이 → 대칭
    const band = (x0: number, x1: number, fill: string): string => `<rect x="${f1(x0)}" y="${TOP + 6}" width="${f1(x1 - x0)}" height="${GROUND - TOP - 6}" fill="${fill}"/>`;
    p += `<path d="M138 ${GROUND} L138 ${TOP + 8} Q138 ${TOP - 2} ${SX} ${TOP - 4} Q162 ${TOP - 2} 162 ${TOP + 8} L162 ${GROUND} Z" fill="url(#${A}stem)" stroke="#1F4F1F" stroke-width="1"/>`;
    p += band(138.9, 141.6, "#5FA84E") + band(158.4, 161.1, "#4E9A43");
    p += band(141.6, 144.4, `url(#${A}phl)`) + band(155.6, 158.4, `url(#${A}phl)`);
    p += band(144.4, 144.9, "#C9E6A0") + band(155.1, 155.6, "#C9E6A0");
    p += band(144.9, 147.7, `url(#${A}xyl)`) + band(152.3, 155.1, `url(#${A}xyl)`);
    p += band(147.7, 152.3, "#EEF3DD");
    // 체관의 체판(가로 칸막이), 물관의 고리 무늬, 고갱이의 세포
    for (let y = TOP + 12; y < GROUND; y += 9) {
      p += `<line x1="141.6" y1="${y}" x2="144.4" y2="${y}" stroke="#A97C1E" stroke-width=".6"/><line x1="155.6" y1="${y + 4}" x2="158.4" y2="${y + 4}" stroke="#A97C1E" stroke-width=".6"/>`;
      p += `<line x1="147.7" y1="${y + 2}" x2="152.3" y2="${y + 2}" stroke="#C9D3B4" stroke-width=".5"/>`;
    }
    for (let y = TOP + 9; y < GROUND; y += 3.2) p += `<line x1="145" y1="${f1(y)}" x2="147.6" y2="${f1(y + 1.2)}" stroke="#2F6FA8" stroke-width=".55" opacity=".8"/><line x1="152.4" y1="${f1(y + 1.2)}" x2="155" y2="${f1(y)}" stroke="#2F6FA8" stroke-width=".55" opacity=".8"/>`;
    p += `<path d="M138.9 ${TOP + 8} L138.9 ${GROUND} M161.1 ${TOP + 8} L161.1 ${GROUND}" stroke="#2F6F2F" stroke-width=".8"/>`;
    // 물관 속의 물: 늘 아래에서 위로
    p += `<path d="M146.3 ${GROUND + 2} L146.3 ${TOP + 8} M153.7 ${GROUND + 2} L153.7 ${TOP + 8}" stroke="${P.water}" stroke-width="1.6" stroke-dasharray="3 5" class="g2u5x-dash"/>`;
    // 원뿌리, 곁뿌리, 뿌리털(뿌리의 물관이 줄기의 물관으로 이어진다)
    p += rootStrand(A, [[SX, GROUND - 2], [149, 196], [147, 212], [148, 230]], 8, { hairs: 18, seed: 3, hairLen: 5 });
    p += rootStrand(A, [[148, 190], [130, 198], [112, 206], [96, 210]], 3, { hairs: 12, seed: 5, hairLen: 4 });
    p += rootStrand(A, [[151, 194], [170, 202], [190, 210], [206, 214]], 3, { hairs: 12, seed: 7, hairLen: 4 });
    // 꽃가지(잎 위 마디에서 왼쪽 위로), 속에 체관이 이어진다
    p += `<path d="M139 80 C128 74, 116 66, 104 59" stroke="#2F6F2F" stroke-width="5.4" fill="none" stroke-linecap="round"/><path d="M139 80 C128 74, 116 66, 104 59" stroke="#5FA84E" stroke-width="3.6" fill="none" stroke-linecap="round"/><path d="M139 79.4 C128 73.4, 116 65.4, 105 59" stroke="#E9C46A" stroke-width="1" fill="none"/>`;
    // 잎(잎자루가 마디에서 왼쪽으로), 가운데 맥 속의 체관
    p += leafBlade(A, 139, 121, 184, 96, 28, { pet: 10, seed: 6, veinOp: 0.9 });
    p += `<path d="M${LEAF[0]} ${LEAF[1]} L128 121 L${PHL} 119" stroke="#E9C46A" stroke-width="1.3" fill="none" opacity=".9"/>`;
    // 줄기를 가로로 자르는 자리와 원(가로 단면)을 잇는 선
    p += `<ellipse cx="${SX}" cy="156" rx="13" ry="3.2" fill="none" stroke="#9CC2FF" stroke-width="1.2"/><path d="M163 154 L272 124 M163 158 L272 152" stroke="#9CC2FF" stroke-width="1" stroke-dasharray="3 3" opacity=".7"/>`;
    return p;
  };
  ly.set("plant", plantBase());
  // 원: 줄기의 가로 단면(관다발 고리, 바깥쪽 체관, 안쪽 물관)과 이름표
  ly.set(
    "inset",
    `<circle cx="298" cy="138" r="31.5" fill="#0E1A2E"/><g clip-path="url(#${A}in)">${stemSection(298, 138, 29, { bundles: 8, seed: 4 })}</g><circle cx="298" cy="138" r="31" fill="none" stroke="#9CC2FF" stroke-width="1.6"/>` +
      `<path d="M${f1(298 + Math.cos(3.6) * 23.8)} ${f1(138 + Math.sin(3.6) * 23.8)} L244 106" stroke="#F3D78C" stroke-width="1"/><circle cx="${f1(298 + Math.cos(3.6) * 23.8)}" cy="${f1(138 + Math.sin(3.6) * 23.8)}" r="1.8" fill="#F3D78C"/>` +
      label(240, 110, "체관", { anchor: "end", size: 12, fill: "#F3D78C" }) +
      `<path d="M${f1(298 + Math.cos(2.6) * 15.5)} ${f1(138 + Math.sin(2.6) * 15.5)} L244 166" stroke="#9AC8F2" stroke-width="1"/><circle cx="${f1(298 + Math.cos(2.6) * 15.5)}" cy="${f1(138 + Math.sin(2.6) * 15.5)}" r="1.8" fill="#9AC8F2"/>` +
      label(240, 170, "물관", { anchor: "end", size: 12, fill: "#9AC8F2" }) +
      label(298, 100, "줄기의 단면", { size: 12, fill: P.dim }) +
      // 세로로 가른 줄기에도 이름(학생이 고르는 길): 오른쪽 체관과 물관 띠에 짧은 지시선
      `<path d="M157 72 L180 72" stroke="#F3D78C" stroke-width="1"/><circle cx="157" cy="72" r="1.6" fill="#F3D78C"/>` +
      label(183, 76, "체관", { anchor: "start", size: 12, fill: "#F3D78C" }) +
      `<path d="M153.7 96 L180 96" stroke="#9AC8F2" stroke-width="1"/><circle cx="153.7" cy="96" r="1.6" fill="#9AC8F2"/>` +
      label(183, 100, "물관", { anchor: "start", size: 12, fill: "#9AC8F2" }),
  );

  /** 도착하면 바뀌는 곳: 새순(어린잎이 자란다), 꽃(봉오리가 핀다), 뿌리(녹말이 쌓인다). */
  const parts = (): string => {
    const k = (d: Dest): number => (got.has(d) ? 1 : 0);
    let p = "";
    // 새순: 꼭대기의 눈과 어린잎 둘
    const sz = 1 + k("shoot") * 0.5;
    p += leafBlade(A, SX - 1, TOP - 2, -128, 14 * sz, 5 * sz, { pet: 2, seed: 2, teeth: 6 }) + leafBlade(A, SX + 1, TOP - 2, -52, 14 * sz, 5 * sz, { pet: 2, seed: 4, teeth: 6 });
    p += `<ellipse cx="${SX}" cy="${TOP - 5}" rx="3.6" ry="5.4" fill="#86D68F" stroke="#2F6F2F" stroke-width=".8"/>`;
    // 꽃: 봉오리(꽃받침이 감싼 분홍 끝) 또는 핀 꽃(꽃잎 다섯, 수술)
    if (got.has("flower")) {
      for (let i = 0; i < 5; i++) {
        const a = (i * 72 - 90) * (Math.PI / 180);
        p += `<g transform="translate(98 52) rotate(${f1((a * 180) / Math.PI + 90)})"><path d="M0 0 C-7 -3, -8 -13, 0 -16 C8 -13, 7 -3, 0 0 Z" fill="url(#${A}petal)" stroke="#C4587A" stroke-width=".8"/><path d="M0 -2 L0 -12" stroke="#E5779A" stroke-width=".6" opacity=".7"/></g>`;
      }
      p += `<circle cx="98" cy="52" r="4.6" fill="#FFD43B" stroke="#B8860B" stroke-width=".8"/>`;
      for (let i = 0; i < 8; i++) p += `<circle cx="${f1(98 + Math.cos(i * 0.785) * 3)}" cy="${f1(52 + Math.sin(i * 0.785) * 3)}" r=".9" fill="#E69500"/>`;
    } else {
      p += `<g transform="translate(100 56) rotate(-56)"><path d="M0 0 C-5 -4, -5 -14, 0 -18 C5 -14, 5 -4, 0 0 Z" fill="#F5A6BC" stroke="#C4587A" stroke-width=".8"/><path d="M0 0 C-7 -3, -7 -10, -3 -13 L0 -6 L3 -13 C7 -10, 7 -3, 0 0 Z" fill="#5FA84E" stroke="#2F6F2F" stroke-width=".8"/></g>`;
    }
    // 뿌리에 쌓인 녹말(설탕이 도착하면)
    if (got.has("root")) p += starchChain(A, 148, 203, 3, 2.6, { rot: 90, cls: "g2u5x-pop" }) + starchChain(A, 140, 214, 2, 2.4, { rot: 60, cls: "g2u5x-pop" });
    // 흐린 이름표
    p += label(78, 60, "꽃", { size: 12, fill: P.dim, anchor: "end" }) + label(174, 54, "새순", { size: 12, fill: P.dim, anchor: "start" }) + label(186, 226, "뿌리", { size: 12, fill: P.dim, anchor: "start" });
    return p;
  };

  const draw = (): void => {
    const sugar = open || fail === "xylem";
    ly.set("parts", art([...got].sort().join(","), parts));
    // 잎 속의 녹말 사슬, 또는 바뀐 설탕
    let load = GRAINS.map(([x, y], i) => (sugar ? sucrose(A, x, y, 3.6, { rot: i * 25 }) : starchChain(A, x, y, 4, 3.2, { rot: i * 30 - 20, cls: fail === "starch" ? "g2u5x-shake" : "", style: `animation-delay:${i * 0.05}s` }))).join("");
    load += label(84, 160, sugar ? "잎의 설탕" : "잎의 녹말", { size: 12, fill: sugar ? P.sugar : "#A9B0FF" });
    if (open) load += `<path d="M${PHL} ${GROUND} L${PHL} ${TOP + 8}" stroke="${P.sugar}" stroke-width="1.4" stroke-dasharray="2 4" opacity=".9"/>`;
    if (fail === "xylem") load += `<g class="g2u5x-shake">${sucrose(A, 146.3, 121, 4.2)}</g>`;
    ly.set("load", load);
    ly.set(
      "notes",
      (Object.keys(DEST) as Dest[])
        .filter((d) => got.has(d))
        .map((d) => tag(d === "shoot" ? 226 : d === "flower" ? 64 : 268, d === "shoot" ? 26 : d === "flower" ? 22 : 208, DEST[d].note, { size: 12, fill: P.leafHi }))
        .join(""),
    );
    ly.set("dot", dot ? sucrose(A, dot[0], dot[1], 4.6) : "");
    host.dataset.g5Open = open ? "1" : "0";
    host.dataset.g5Fail = fail;
    host.dataset.g5Got = String(got.size);
  };

  // 1단계: 형태와 통로를 정해 내보낸다
  const cStarch = chip("starch", "녹말 그대로", "", () => pickForm("starch"));
  const cSugar = chip("sugar", "설탕으로 바꿔서", "", () => pickForm("sugar"));
  const cXylem = chip("xylem", "물관으로", "", () => pickTube("xylem"));
  const cPhloem = chip("phloem", "체관으로", "", () => pickTube("phloem"));
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
  const send = bvBtn("main g2u5x-send", "잎에서 내보내기");
  send.addEventListener("click", () => {
    if (busy) return;
    if (!form || !tube) {
      tap();
      f.say("보낼 <b>형태</b>와 지나갈 <b>통로</b>를 하나씩 골라요.");
      return;
    }
    if (form === "starch") {
      bad();
      lab.slip();
      fail = "starch";
      draw();
      toast(lab, "녹말이 잎을 떠나지 못해요", true);
      f.say("녹말은 <b>물에 녹지 않아</b> 관을 따라 흐르지 못해요. 형태를 바꿔요.");
      return;
    }
    if (tube === "xylem") {
      bad();
      lab.slip();
      fail = "xylem";
      draw();
      toast(lab, "물관에는 실리지 않아요", true);
      f.say("물관은 뿌리의 <b>물이 올라오는</b> 길이에요. 양분은 다른 관으로 가요.");
      return;
    }
    good();
    fail = "";
    open = true;
    f.pips(1);
    draw();
    f.slot.setControls(row(...dests.map((c) => c.el)), go);
    f.say("녹말이 <b>설탕</b>으로 바뀌어 체관에 실렸어요. 어디로 보낼까요?");
  });

  // 2단계: 보낼 곳
  const dests = (Object.keys(DEST) as Dest[]).map((d) =>
    chip(d, DEST[d].name, "", () => {
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
        dests.find((c) => c.el.dataset.k === d)?.done();
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
  const go = bvBtn("main g2u5x-go", "양분이 간 길 정리하기");
  go.disabled = true;
  go.addEventListener("click", () => {
    tap();
    lab.judge("잎의 양분은 어떤 모습으로 이동했나요?", [{ t: "설탕으로 바뀌어 체관으로", ok: true }, { t: "녹말 그대로 체관으로" }, { t: "설탕으로 바뀌어 물관으로" }], "물에 녹는 <b>설탕</b>이 되어 <b>체관</b>을 따라 갔어요.", () =>
      lab.finish("잎의 녹말은 <b>설탕</b>으로 바뀌어 <b>체관</b>을 따라 이동해요. 새순과 꽃이 있는 위로도, 뿌리가 있는 아래로도 가서 쓰이거나 저장돼요."),
    );
  });

  f.slot.setControls(row(cStarch.el, cSugar.el), row(cXylem.el, cPhloem.el), send);
  draw();
  f.say("잎에 <b>녹말</b>이 쌓여 있어요. 어떤 모습으로, 어느 관으로 내보낼까요?");
  return lab.cleanup;
};
