// [중2 Ⅴ v5] 아이오딘 아이오딘화 칼륨 용액을 쓰는 랩 두 판(g2u5l2, g2u5l6).
//
// g2u5StarchLab 「빛을 받은 잎에만 무엇이 생길까요?」 (g2u5l2)
//   책의 탐구 2: 상추 모종 둘 가운데 하나에만 어둠상자를 씌워 하루 둔다 → 잎 조각을 에탄올에 넣고 뜨거운 물에 담가 탈색한다
//   → 증류수로 헹군다 → 아이오딘 아이오딘화 칼륨 용액을 떨어뜨린다. 빛을 받은 잎 조각만 청람색이 된다.
//   학생이 정하는 것: 어둠상자를 씌울지, 에탄올을 데우는 방법, 처리의 차례.
//   실패하는 길: ① 어둠상자 없이 두면 두 조각이 모두 청람색이라 견줄 수 없다(처음부터 다시)
//               ② 탈색하지 않고 용액을 떨어뜨리면 초록색에 가려 색 변화가 보이지 않는다(새 조각으로 다시)
//               ③ 알코올램프 불로 직접 데우려 하면 위험하다고 막는다 ④ 헹구지 않으면 용액을 떨어뜨릴 수 없다.
//   그림(2026-11-15 다시 그림): 책의 그림 ③④처럼 뜨거운 물(80~100 ℃)이 든 비커에 에탄올 시험관 둘을 세워 잎 조각을 탈색하고(엽록소가 녹아 나와
//   에탄올이 초록이 된다), 페트리 접시의 잎 조각(약 1 cm, 잎맥이 보인다)에 스포이트로 용액을 떨어뜨린다. 어둠상자는 입체 상자.
//
// g2u5StoreLab 「저장된 양분은 모두 녹말일까요?」 (g2u5l6)
//   책의 그림(작물마다 다른 저장 형태)을 같은 용액으로 확인한다. 학생이 정하는 것: 용액을 떨어뜨릴 작물.
//   고구마와 감자는 청람색, 포도와 콩과 깨는 변화가 없다(녹말이 아닌 형태로 저장한다).
//   그림(2026-11-15 다시 그림): 자른 면이 보이는 작물(고구마 뿌리, 감자 덩이줄기, 반 가른 포도, 콩 두 알과 반 가른 콩, 깨 한 줌)과
//   유리 스포이트. 녹말이 있으면 떨어진 자리부터 청람색이 번지고, 없으면 갈색 방울이 그대로 남는다.

import type { StepRenderer } from "../../types";
import { P, bad, bvBtn, chip, g5Lab, good, row, tag, tap, toast, txt, type G5Step } from "./kit";
import { beam, f1, g5Layers, label, lettuce, memo, newNs, particleDefs, plantDefs, pot, rng, smooth, sun, sunDefs, type Pt } from "./art";

const IODINE = "#C58A2E";
const BLUE = "#2B2F8A";

/** 유리 기구 그라데이션과 액체 색. */
function labDefs(ns: string): string {
  return (
    `<linearGradient id="${ns}gl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#DDEBFF" stop-opacity=".28"/><stop offset=".18" stop-color="#DDEBFF" stop-opacity=".06"/><stop offset=".78" stop-color="#DDEBFF" stop-opacity=".05"/><stop offset="1" stop-color="#DDEBFF" stop-opacity=".22"/></linearGradient>` +
    `<linearGradient id="${ns}hot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#CFE8FF" stop-opacity=".30"/><stop offset="1" stop-color="#7FB8E6" stop-opacity=".22"/></linearGradient>` +
    `<linearGradient id="${ns}eth" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#F2F6FF" stop-opacity=".35"/><stop offset="1" stop-color="#C9D8F0" stop-opacity=".25"/></linearGradient>` +
    `<linearGradient id="${ns}ethG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7FD38A" stop-opacity=".8"/><stop offset="1" stop-color="#3FA35B" stop-opacity=".8"/></linearGradient>` +
    `<linearGradient id="${ns}io" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E0A64A"/><stop offset="1" stop-color="#A86A14"/></linearGradient>` +
    `<radialGradient id="${ns}blue" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#3E44B0"/><stop offset=".6" stop-color="#262A86"/><stop offset="1" stop-color="#14164A"/></radialGradient>` +
    `<linearGradient id="${ns}bulb" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8E1F16"/><stop offset=".4" stop-color="#E05A47"/><stop offset="1" stop-color="#8E1F16"/></linearGradient>` +
    `<linearGradient id="${ns}box" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2B3240"/><stop offset="1" stop-color="#151A23"/></linearGradient>`
  );
}

/** 유리 스포이트(빨간 고무 꼭지, 앰버색 용액, 끝의 방울). (x, y)는 끝(방울이 맺히는 곳). */
export function dropper(ns: string, x: number, y: number, drop = true): string {
  let s = `<path d="M${f1(x - 3.2)} ${f1(y - 28)} L${f1(x - 3.2)} ${f1(y - 8)} L${f1(x - 1)} ${f1(y - 1)} L${f1(x + 1)} ${f1(y - 1)} L${f1(x + 3.2)} ${f1(y - 8)} L${f1(x + 3.2)} ${f1(y - 28)} Z" fill="url(#${ns}gl)" stroke="#B9CCE6" stroke-width=".9"/>`;
  s += `<path d="M${f1(x - 2.4)} ${f1(y - 20)} L${f1(x - 2.4)} ${f1(y - 8.4)} L${f1(x - 0.6)} ${f1(y - 2.6)} L${f1(x + 0.6)} ${f1(y - 2.6)} L${f1(x + 2.4)} ${f1(y - 8.4)} L${f1(x + 2.4)} ${f1(y - 20)} Z" fill="url(#${ns}io)"/>`;
  s += `<path d="M${f1(x - 4.6)} ${f1(y - 28)} C${f1(x - 6)} ${f1(y - 40)}, ${f1(x + 6)} ${f1(y - 40)}, ${f1(x + 4.6)} ${f1(y - 28)} Z" fill="url(#${ns}bulb)" stroke="#5E120C" stroke-width=".8"/><rect x="${f1(x - 5)}" y="${f1(y - 29)}" width="10" height="2.6" rx="1" fill="#6E140D"/>`;
  s += `<path d="M${f1(x - 1.8)} ${f1(y - 25)} L${f1(x - 1.8)} ${f1(y - 11)}" stroke="#FFFFFF" stroke-width=".7" opacity=".6"/>`;
  if (drop) s += `<path d="M${x} ${f1(y + 1)} q2.6 3.4 2.6 5 a2.6 2.6 0 0 1 -5.2 0 q0 -1.6 2.6 -5 Z" fill="${IODINE}" stroke="#7A4E0E" stroke-width=".5"/>`;
  return s;
}

// ── 탐구 2: 잎의 녹말 확인 ──────────────────────────────────────────
type Piece = "fresh" | "pale" | "mud" | "blue" | "tan";
const PIECE: Record<Piece, { fill: string; edge: string; vein: string }> = {
  fresh: { fill: "#3FA35B", edge: "#1F6B3A", vein: "#9FD98E" },
  pale: { fill: "#F1EDCB", edge: "#B5AE7A", vein: "#FFFFFF" },
  mud: { fill: "#5A5A2C", edge: "#2A3318", vein: "#8C8A4A" },
  blue: { fill: BLUE, edge: "#14164A", vein: "#4A50B8" },
  tan: { fill: "#E3C27A", edge: "#A07C2E", vein: "#F5DCA0" },
};

/** 잎 조각(가로세로 약 1 cm로 자른 상추 잎, 잎맥이 지난다). 접시에 놓여 비스듬히 보인다(세로 0.62배). (cx, cy) 가운데. */
function leafPiece(ns: string, cx: number, cy: number, p: Piece, cls: string, seed: number): string {
  const r = rng(seed);
  const w = 44;
  const h = 40;
  const k = 0.62;
  const pts: Pt[] = [];
  const corners: Pt[] = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]];
  corners.forEach((c, i) => {
    const d = corners[(i + 1) % 4];
    for (let j = 0; j < 4; j++) {
      const u = j / 4;
      pts.push([c[0] + (d[0] - c[0]) * u + (r() - 0.5) * 1.6, (c[1] + (d[1] - c[1]) * u + (r() - 0.5) * 1.6) * k]);
    }
  });
  const c = PIECE[p];
  let s = `<path d="${smooth(pts, true, 0.35)}" fill="${p === "blue" ? `url(#${ns}blue)` : c.fill}" stroke="${c.edge}" stroke-width="1"/>`;
  // 잎맥: 비스듬한 굵은 맥 하나와 곁맥들
  s += `<path d="M${-w / 2 + 2} ${f1(h * 0.2 * k)} L${w / 2 - 2} ${f1(-h * 0.24 * k)}" stroke="${c.vein}" stroke-width="2" opacity=".7"/>`;
  for (let i = 0; i < 4; i++) {
    const u = -0.36 + i * 0.24;
    const x = u * w;
    const y = (-u * h * 0.44 + 0.0) * k;
    s += `<path d="M${f1(x)} ${f1(y)} l${f1(-6)} ${f1(-10 * k)} M${f1(x)} ${f1(y)} l${f1(7)} ${f1(9 * k)}" stroke="${c.vein}" stroke-width=".8" opacity=".55"/>`;
  }
  if (p === "blue") for (let i = 0; i < 9; i++) s += `<circle cx="${f1((r() - 0.5) * w * 0.8)}" cy="${f1((r() - 0.5) * h * 0.7 * k)}" r="${f1(1.2 + r() * 2)}" fill="#0E1040" opacity=".55"/>`;
  if (p === "tan" || p === "mud") s += `<ellipse cx="${f1((r() - 0.5) * 6)}" cy="${f1((r() - 0.5) * 4)}" rx="9" ry="${f1(6 * k + 1)}" fill="${IODINE}" opacity=".55"/>`;
  return `<g transform="translate(${f1(cx)} ${f1(cy)})"><g class="${cls}">${s}</g></g>`;
}
/** 페트리 접시(비스듬히 본 유리 접시). (cx, cy)는 바닥 가운데. */
function petri(cx: number, cy: number, rx: number, ry: number): { back: string; front: string } {
  const back = `<ellipse cx="${cx}" cy="${f1(cy + 4)}" rx="${f1(rx + 2)}" ry="${f1(ry + 2)}" fill="#000" opacity=".28"/><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="rgba(200,225,255,.10)" stroke="#9CB4D6" stroke-width="1.2"/><ellipse cx="${cx}" cy="${f1(cy + 1.5)}" rx="${f1(rx - 6)}" ry="${f1(ry - 4)}" fill="rgba(200,225,255,.05)"/>`;
  const front = `<path d="M${f1(cx - rx)} ${cy} L${f1(cx - rx)} ${f1(cy - 6)} M${f1(cx + rx)} ${cy} L${f1(cx + rx)} ${f1(cy - 6)}" stroke="#B9CCE6" stroke-width="1"/><path d="M${f1(cx - rx)} ${f1(cy - 6)} A${rx} ${ry} 0 0 0 ${f1(cx + rx)} ${f1(cy - 6)}" fill="none" stroke="#DCEBFF" stroke-width="1.3" opacity=".8"/><path d="M${f1(cx - rx)} ${cy} A${rx} ${ry} 0 0 0 ${f1(cx + rx)} ${cy}" fill="none" stroke="#B9CCE6" stroke-width="1"/><path d="M${f1(cx - rx * 0.7)} ${f1(cy + ry * 0.55)} A${rx} ${ry} 0 0 0 ${f1(cx - rx * 0.1)} ${f1(cy + ry * 0.98)}" stroke="#FFFFFF" stroke-width="1.6" fill="none" opacity=".35"/>`;
  return { back, front };
}
/** 시험관(에탄올과 잎 조각). (x, top)은 입구 가운데, 바닥은 bottom. */
function testTube(ns: string, x: number, top: number, bottom: number, liquidTop: number, green: boolean, leaf: "fresh" | "pale" | null): string {
  const r = 6.4;
  let s = `<path d="M${f1(x - r)} ${top} L${f1(x - r)} ${f1(bottom - r)} A${r} ${r} 0 0 0 ${f1(x + r)} ${f1(bottom - r)} L${f1(x + r)} ${top}" fill="url(#${ns}gl)" stroke="#B9CCE6" stroke-width="1.1"/>`;
  s += `<path d="M${f1(x - r + 1.2)} ${liquidTop} L${f1(x - r + 1.2)} ${f1(bottom - r)} A${r - 1.2} ${r - 1.2} 0 0 0 ${f1(x + r - 1.2)} ${f1(bottom - r)} L${f1(x + r - 1.2)} ${liquidTop} Z" fill="url(#${ns}${green ? "ethG" : "eth"})"/>`;
  s += `<ellipse cx="${x}" cy="${liquidTop}" rx="${f1(r - 1.2)}" ry="1.2" fill="#FFFFFF" opacity=".35"/>`;
  // 시험관 바닥의 잎 조각(말린 채 가라앉아 있다)
  if (leaf) s += `<path d="M${f1(x - 4)} ${f1(bottom - 7)} q4 -5 8 -1 q-2 5 -8 1 Z" fill="${leaf === "fresh" ? "#3FA35B" : "#EDE7BE"}" stroke="${leaf === "fresh" ? "#1F6B3A" : "#B5AE7A"}" stroke-width=".7"/>`;
  s += `<rect x="${f1(x - r - 1.4)}" y="${f1(top - 2)}" width="${f1(2 * r + 2.8)}" height="3" rx="1.4" fill="#C9D8EE" opacity=".8"/>`;
  s += `<path d="M${f1(x - r + 1.8)} ${f1(top + 4)} L${f1(x - r + 1.8)} ${f1(bottom - 9)}" stroke="#FFFFFF" stroke-width="1" opacity=".45"/>`;
  return s;
}

export const g2u5StarchLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G5Step;
  const lab = g5Lab(host, api, s, { steps: 3, cls: "g2u5x-starch", wait: "실험을 차례대로 해 보세요" });
  const { f, tm } = lab;
  const A = newNs("st");
  const ly = g5Layers(lab, "상추 모종 두 개와 어둠상자, 잎 조각을 처리하는 실험대", ["defs", "scene"]);
  const art = memo<string>();
  ly.set("defs", `<defs>${particleDefs(A)}${plantDefs(A)}${sunDefs(A)}${labDefs(A)}</defs>`);
  let phase: "prep" | "bench" = "prep";
  let box = false;
  let pale = false;
  let rinsed = false;
  let pieces: [Piece, Piece] = ["fresh", "fresh"];
  let busy = false;
  let flame = false;
  let dropped = false;

  /** 어둠상자(빛이 들지 않는 검은 상자, 앞면과 윗면과 옆면). (x, y) 앞면 왼쪽 위, w×h. */
  const darkBox = (x: number, y: number, w: number, h: number): string => {
    const d: Pt = [12, -9];
    return (
      `<g class="g2u5x-pop"><path d="M${x} ${y} L${x + d[0]} ${y + d[1]} L${x + w + d[0]} ${y + d[1]} L${x + w} ${y} Z" fill="#3A4252" stroke="#5E6B80" stroke-width="1"/>` +
      `<path d="M${x + w} ${y} L${x + w + d[0]} ${y + d[1]} L${x + w + d[0]} ${y + h + d[1]} L${x + w} ${y + h} Z" fill="#1A1F29" stroke="#5E6B80" stroke-width="1"/>` +
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${A}box)" stroke="#5E6B80" stroke-width="1.2"/>` +
      `<path d="M${x + 4} ${y + 4} L${x + w - 4} ${y + 4}" stroke="#7D8AA1" stroke-width="1" opacity=".6"/><path d="M${x + 6} ${y + 10} L${x + 6} ${y + h - 6}" stroke="#4A5568" stroke-width="1" opacity=".5"/>` +
      txt(x + w / 2, y + h / 2 + 4, "어둠상자", { size: 13, fill: "#C6D3E6" }) +
      `</g>`
    );
  };

  const draw = (fx = ""): void => {
    if (phase === "prep") {
      ly.set(
        "scene",
        art(`prep${box}`, () => {
          let sc = sun(A, 173, 30, 13, true);
          sc += beam(A, [158, 42], [104, 128], 12, { cls: "g2u5x-flow" }) + beam(A, [188, 42], [242, 128], 12, { cls: "g2u5x-flow" });
          sc += `<rect x="20" y="190" width="306" height="5" rx="2" fill="#3A4C68"/><rect x="20" y="190" width="306" height="1.6" fill="#5F7598" opacity=".8"/>`;
          sc += lettuce(A, 100, 166, 1.12, { seed: 5 }) + pot(A, 100, 190, 36, 20);
          sc += lettuce(A, 246, 166, 1.12, { seed: 9 }) + pot(A, 246, 190, 36, 20);
          if (box) sc += darkBox(192, 86, 104, 104);
          sc += tag(100, 218, "모종 가", { size: 12 }) + tag(246, 218, "모종 나", { size: 12 });
          return sc;
        }),
      );
    } else {
      const d1 = petri(92, 184, 62, 19);
      const d2 = petri(254, 184, 62, 19);
      let sc = "";
      // 뜨거운 물이 든 비커와 에탄올 시험관 둘(물중탕)
      sc += `<ellipse cx="173" cy="104" rx="52" ry="4" fill="#000" opacity=".25"/>`;
      sc += `<path d="M128 40 L128 98 Q128 102 132 102 L214 102 Q218 102 218 98 L218 40" fill="url(#${A}gl)" stroke="#B9CCE6" stroke-width="1.4"/>`;
      sc += `<path d="M129.4 56 L129.4 97.6 Q129.4 100.6 132.4 100.6 L213.6 100.6 Q216.6 100.6 216.6 97.6 L216.6 56 Z" fill="url(#${A}hot)"/>`;
      sc += `<path d="M129.4 56 Q151 53 173 56 Q195 59 216.6 56" stroke="#EAF5FF" stroke-width="1" fill="none" opacity=".7"/>`;
      sc += `<path d="M124 40 L128 40 M218 40 L224 38" stroke="#B9CCE6" stroke-width="1.4"/>`;
      [70, 80, 90].forEach((y, i) => (sc += `<line x1="${132 + i}" y1="${y}" x2="${140 + i}" y2="${y}" stroke="#DCEBFF" stroke-width=".8" opacity=".6"/>`));
      sc += `<path d="M134 46 L134 94" stroke="#FFFFFF" stroke-width="1.6" opacity=".25"/>`;
      // 김(뜨거운 물)
      [146, 200].forEach((x, i) => (sc += `<path class="g2u5x-flow" style="animation-delay:${i * 0.5}s" d="M${x} 50 q-4 -6 0 -12 q4 -6 0 -12" stroke="#DCEBFF" stroke-width="1.4" fill="none" opacity=".5"/>`));
      // 잎 조각은 한 번에 한 곳에만 있다: 물중탕 동안(탈색 뒤 헹구기 전)은 시험관 속, 그 밖에는 접시 위
      const inTube = pale && !rinsed;
      sc += testTube(A, 160, 30, 96, 62, pale, inTube ? "pale" : null) + testTube(A, 186, 30, 96, 62, pale, inTube ? "pale" : null);
      // 위험한 길: 에탄올 시험관을 알코올램프 불꽃에 바로 대는 장면(물중탕 비커 밖)
      if (flame)
        sc +=
          `<g class="g2u5x-blink"><g transform="rotate(-18 286 44)">${testTube(A, 286, 22, 66, 40, false, "fresh")}</g>` +
          `<path d="M275 104 L297 104 Q301 104 299 99 L293 90 L279 90 L273 99 Q271 104 275 104 Z" fill="rgba(200,225,255,.16)" stroke="#B9CCE6" stroke-width="1"/><path d="M274 101 L298 101 L295 94 L277 94 Z" fill="rgba(210,230,255,.22)"/>` +
          `<rect x="281.5" y="85" width="9" height="5" rx="1" fill="#8C9AAF" stroke="#4A5568" stroke-width=".6"/><line x1="286" y1="85" x2="286" y2="82" stroke="#F2EAD8" stroke-width="1.4"/>` +
          `<path d="M286 83 C279 77, 283 71, 286 65 C289 71, 293 77, 286 83 Z" fill="#FF8A3C" stroke="#C4501A" stroke-width="1"/><path d="M286 81 C283 77, 285 73, 286 70 C287 73, 289 77, 286 81 Z" fill="#FFE066"/></g>`;
      sc += label(118, 64, "에탄올", { anchor: "end", size: 12, fill: P.dim }) + `<path d="M120 60 L152 58" stroke="#8CA2C0" stroke-width=".9"/>`;
      if (!flame) sc += label(226, 84, "뜨거운 물", { anchor: "start", size: 12, fill: P.dim });
      // 접시와 잎 조각
      sc += d1.back + d2.back;
      if (!inTube) sc += leafPiece(A, 92, 180, pieces[0], fx, 3) + leafPiece(A, 254, 180, pieces[1], fx, 8);
      sc += d1.front + d2.front;
      sc += tag(92, 120, "빛을 받은 잎", { size: 12 }) + tag(254, 120, box ? "어둠상자 속 잎" : "빛을 받은 잎", { size: 12 });
      if (dropped) sc += dropper(A, 112, 168, false) + dropper(A, 274, 168, false);
      ly.set("scene", sc);
    }
    host.dataset.g5Stage = phase;
    host.dataset.g5Pieces = pieces.join(",");
  };

  // 준비: 어둠상자와 하루 두기
  const cBox = chip("box", "모종 나에 어둠상자", "씌우지 않음", () => {
    if (busy) return;
    tap();
    box = !box;
    cBox.on(box);
    cBox.sub(box ? "씌움" : "씌우지 않음");
    draw();
  });
  const day = bvBtn("main g2u5x-day", "햇빛이 드는 곳에 하루 두기");
  day.addEventListener("click", () => {
    if (busy) return;
    tap();
    phase = "bench";
    pale = false;
    rinsed = false;
    dropped = false;
    pieces = ["fresh", "fresh"];
    f.pips(1);
    draw("g2u5x-pop");
    f.slot.setControls(row(cBath.el, cFire.el), row(cRinse.el, cDrop.el));
    f.say("하루 뒤 두 모종에서 잎을 따 조각을 냈어요. <b>무엇부터</b> 할까요?");
  });
  const toPrep = (): void => {
    phase = "prep";
    busy = false;
    flame = false;
    dropped = false;
    f.pips(0);
    draw();
    f.slot.setControls(row(cBox.el), day);
    f.say("한 모종에만 <b>어둠상자</b>를 씌울 수 있어요. 준비를 마치고 하루를 보내요.");
  };

  // 실험대: 처리 네 가지
  const cBath = chip("bath", "뜨거운 물에 담그기", "에탄올에 넣은 잎을", () => {
    if (busy || pale) return;
    good();
    pale = true;
    flame = false;
    pieces = ["pale", "pale"];
    f.pips(2);
    cBath.done();
    draw("g2u5x-pop");
    f.say("잎의 초록색이 에탄올로 <b>빠져나왔어요</b>. 잎 조각이 하얗게 됐어요.");
  });
  const cFire = chip("fire", "알코올램프로 가열", "에탄올에 넣은 잎을", () => {
    if (busy) return;
    bad();
    lab.slip();
    flame = true;
    draw();
    toast(lab, "불이 붙을 수 있어 위험해요", true);
    f.say("에탄올은 불이 잘 붙어요. 불로 데우지 말고 <b>뜨거운 물</b>에 담가요.");
    tm.later(() => {
      flame = false;
      if (phase === "bench") draw();
    }, 1600);
  });
  const cRinse = chip("rinse", "증류수로 헹구기", "", () => {
    if (busy || rinsed) return;
    tap();
    if (!pale) {
      f.say("물로 헹궈도 잎의 초록색은 <b>빠지지 않아요</b>. 다른 방법을 찾아요.");
      return;
    }
    rinsed = true;
    cRinse.done();
    f.say("잎 조각에 묻은 에탄올을 씻어 냈어요. 이제 <b>용액</b>을 떨어뜨려요.");
  });
  const cDrop = chip("drop", "아이오딘 용액", "한 방울씩 떨어뜨리기", () => {
    if (busy) return;
    if (pale && !rinsed) {
      bad();
      f.say("잎 조각에 에탄올이 묻어 있어요. <b>증류수로 먼저</b> 헹궈요.");
      return;
    }
    busy = true;
    dropped = true;
    if (!pale) {
      bad();
      lab.slip();
      pieces = ["mud", "mud"];
      draw("g2u5x-pop");
      host.dataset.g5Fail = "green";
      toast(lab, "색 변화가 보이지 않아요", true);
      f.say("잎의 <b>초록색에 가려</b> 색이 변했는지 알 수 없어요. 새 조각으로 다시 해요.");
      tm.later(() => {
        pieces = ["fresh", "fresh"];
        dropped = false;
        busy = false;
        draw("g2u5x-pop");
      }, 2200);
      return;
    }
    if (!box) {
      bad();
      lab.slip();
      pieces = ["blue", "blue"];
      draw("g2u5x-pop");
      host.dataset.g5Fail = "nobox";
      toast(lab, "두 조각 모두 청람색이에요", true);
      f.say("둘 다 빛을 받아 <b>견줄 수 없어요</b>. 처음으로 돌아가 다시 준비해요.");
      tm.later(() => {
        cBath.el.classList.remove("done");
        cRinse.el.classList.remove("done");
        toPrep();
      }, 2600);
      return;
    }
    good();
    pieces = ["blue", "tan"];
    draw("g2u5x-pop");
    host.dataset.g5Fail = "";
    f.say("빛을 받은 잎 조각만 <b>청람색</b>으로 변했어요.");
    tm.later(() => {
      lab.judge("<b>청람색</b>으로 변한 잎 조각은?", [{ t: "빛을 받은 잎 조각", ok: true }, { t: "어둠상자 속 잎 조각" }, { t: "두 조각 모두" }], "청람색은 그곳에 <b>녹말</b>이 있다는 표시예요.", () =>
        lab.finish("<b>빛을 받은 잎</b>에서만 <b>녹말</b>이 확인됐어요. 빛을 받아 광합성을 한 잎에 양분이 만들어진 거예요."),
      );
    }, 1700);
  });

  toPrep();
  return lab.cleanup;
};

// ── 작물의 저장 양분 ────────────────────────────────────────────────
type Crop = "sweet" | "potato" | "grape" | "bean" | "sesame";
const CROP: Record<Crop, { name: string; part: string; form: string; starch: boolean }> = {
  sweet: { name: "고구마", part: "뿌리", form: "녹말", starch: true },
  potato: { name: "감자", part: "줄기", form: "녹말", starch: true },
  grape: { name: "포도", part: "열매", form: "포도당", starch: false },
  bean: { name: "콩", part: "씨", form: "단백질", starch: false },
  sesame: { name: "깨", part: "씨", form: "지방", starch: false },
};
const ORDER: Crop[] = ["sweet", "potato", "grape", "bean", "sesame"];

function cropDefs(ns: string): string {
  const rad = (id: string, a: string, b: string, c: string, cx = ".42", cy = ".38"): string => `<radialGradient id="${ns}${id}" cx="${cx}" cy="${cy}" r=".72"><stop offset="0" stop-color="${a}"/><stop offset=".6" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></radialGradient>`;
  return (
    rad("sw", "#FFF0C9", "#F4D592", "#E2B866") +
    rad("po", "#FFFBEA", "#F6EBC6", "#E4D29E") +
    rad("gr", "#E6F5C4", "#C9E39A", "#9DC46E") +
    rad("be", "#FFF3CF", "#F2DB9E", "#D9B86A") +
    rad("se", "#FFFDF4", "#F1E6C9", "#D5C39A") +
    rad("io", "#F3C26A", "#C58A2E", "#8C5A10") +
    `<radialGradient id="${ns}bl" cx=".45" cy=".42" r=".6"><stop offset="0" stop-color="#151848"/><stop offset=".7" stop-color="#262A86"/><stop offset="1" stop-color="#3E44B0" stop-opacity=".85"/></radialGradient>`
  );
}
/** 자른 작물(위에서 비스듬히 본 면). (x, y) 가운데. */
function cropArt(ns: string, k: Crop, x: number, y: number): string {
  const r = rng(k.length * 13 + 5);
  let s = `<ellipse cx="${x}" cy="${y + 15}" rx="22" ry="4" fill="#000" opacity=".3"/>`;
  if (k === "sweet") {
    // 고구마 뿌리를 둥글게 자른 면: 붉은 보라 껍질, 노르스름한 살, 안쪽의 형성층 고리와 점(유액)
    s += `<ellipse cx="${x}" cy="${y + 3}" rx="25" ry="20" fill="#7A2350"/>`;
    s += `<ellipse cx="${x}" cy="${y}" rx="25" ry="20" fill="#9E3468" stroke="#5E1838" stroke-width="1"/>`;
    s += `<ellipse cx="${x}" cy="${y}" rx="22" ry="17.4" fill="url(#${ns}sw)"/>`;
    s += `<ellipse cx="${x}" cy="${y}" rx="17" ry="13.2" fill="none" stroke="#D9AE5E" stroke-width=".8" stroke-dasharray="2 1.6" opacity=".9"/>`;
    for (let i = 0; i < 14; i++) s += `<circle cx="${f1(x + (r() - 0.5) * 34)}" cy="${f1(y + (r() - 0.5) * 24)}" r=".8" fill="#C7954A" opacity=".8"/>`;
  } else if (k === "potato") {
    // 감자(덩이줄기)를 자른 면: 얇은 갈색 껍질과 눈, 흰 살, 관다발 고리
    s += `<ellipse cx="${x}" cy="${y + 3}" rx="26" ry="19" fill="#8C6A3E"/>`;
    s += `<ellipse cx="${x}" cy="${y}" rx="26" ry="19" fill="#B58A55" stroke="#6E4E26" stroke-width="1"/>`;
    s += `<ellipse cx="${x}" cy="${y}" rx="24" ry="17.2" fill="url(#${ns}po)"/>`;
    s += `<ellipse cx="${x - 1}" cy="${y}" rx="18.5" ry="12.6" fill="none" stroke="#D8C79C" stroke-width=".9" stroke-dasharray="1.6 1.2"/>`;
    s += `<path d="M${x - 8} ${y - 2} q8 -6 16 0 q-8 6 -16 0 Z" fill="#FFFFFF" opacity=".35"/>`;
    s += `<circle cx="${x + 21}" cy="${y - 7}" r="1.4" fill="#6E4E26"/><circle cx="${x - 22}" cy="${y + 4}" r="1.2" fill="#6E4E26"/>`;
  } else if (k === "grape") {
    // 포도 한 알을 반 가른 면: 짙은 보라 껍질, 투명한 연두 살, 씨 둘
    s += `<circle cx="${x}" cy="${y + 2.4}" r="21" fill="#2E1645"/>`;
    s += `<circle cx="${x}" cy="${y}" r="21" fill="#4B2A6B" stroke="#24102F" stroke-width="1"/>`;
    s += `<circle cx="${x}" cy="${y}" r="18.4" fill="url(#${ns}gr)"/>`;
    s += `<circle cx="${x}" cy="${y}" r="12" fill="none" stroke="#B6D387" stroke-width=".7" opacity=".8"/>`;
    [[-4.5, 1, -20], [4.5, -1, 20]].forEach(([dx, dy, a]) => (s += `<path transform="translate(${x + dx} ${y + dy}) rotate(${a})" d="M0 -4.6 C2.8 -2, 2.6 3, 0 4.4 C-2.6 3, -2.8 -2, 0 -4.6 Z" fill="#9A7448" stroke="#5E4222" stroke-width=".6"/>`));
    s += `<path d="M${x - 11} ${y - 10} q6 -5 13 -5" stroke="#FFFFFF" stroke-width="1.4" fill="none" opacity=".45"/>`;
  } else if (k === "bean") {
    // 콩 두 알(배꼽이 보인다)과 반 가른 콩(떡잎 두 장)
    const bean = (bx: number, by: number, a: number): string =>
      `<g transform="translate(${bx} ${by}) rotate(${a})"><ellipse rx="9.6" ry="8" fill="url(#${ns}be)" stroke="#A8864A" stroke-width=".9"/><path d="M-3 -6.6 q3 -1 6 0" stroke="#5E4222" stroke-width="1.6" stroke-linecap="round" fill="none"/><path d="M-5 -2 q2 -3 6 -3" stroke="#FFFFFF" stroke-width="1" fill="none" opacity=".5"/></g>`;
    s += bean(x - 12, y + 6, -10) + bean(x + 11, y + 8, 14);
    s += `<g transform="translate(${x} ${y - 7})"><ellipse rx="11" ry="8.6" fill="#E9CF8A" stroke="#A8864A" stroke-width=".9"/><path d="M0 -8.4 L0 8.4" stroke="#B89A5A" stroke-width="1"/><ellipse cx="-5.4" cy="0" rx="4.6" ry="6.4" fill="#F7E6B4" opacity=".8"/><ellipse cx="5.4" cy="0" rx="4.6" ry="6.4" fill="#F4DFA6" opacity=".8"/><path d="M-1.6 -6 q-1.4 2 -.6 4" stroke="#C9A85E" stroke-width=".8" fill="none"/></g>`;
  } else {
    // 깨 한 줌(작고 납작한 물방울 모양의 씨)
    const seeds: [number, number, number][] = [[-12, -6, -30], [0, -10, 10], [12, -4, 40], [-6, 2, 70], [7, 5, -20], [-15, 9, 20], [1, 12, -60], [14, 11, 80], [-3, -2, -10], [9, -12, 60], [-10, 14, 50], [17, 2, -40]];
    seeds.forEach(([dx, dy, a]) => (s += `<path transform="translate(${x + dx} ${y + dy}) rotate(${a})" d="M0 -4.2 C2.6 -2.6, 2.8 2.4, 0 4 C-2.8 2.4, -2.6 -2.6, 0 -4.2 Z" fill="url(#${ns}se)" stroke="#A8925E" stroke-width=".6"/>`));
  }
  return s;
}
/** 용액을 떨어뜨린 뒤: 녹말이면 청람색이 번지고, 아니면 갈색 방울이 그대로. */
function reaction(ns: string, k: Crop, x: number, y: number, pop: boolean): string {
  const cls = pop ? ' class="g2u5x-pop"' : "";
  if (CROP[k].starch) {
    // 떨어진 자리에서 번진 얼룩: 가장자리가 고르지 않은 둥근 모양(별 모양으로 보이지 않게 들쭉날쭉을 작게)
    const r = rng(k.length * 7 + 1);
    const blob: Pt[] = Array.from({ length: 20 }, (_, i) => {
      const a = (i / 20) * Math.PI * 2;
      const rr = 13.5 * (0.86 + r() * 0.2);
      return [x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.76] as Pt;
    });
    return `<g${cls}><path d="${smooth(blob, true)}" fill="url(#${ns}bl)"/><ellipse cx="${x - 3}" cy="${y - 2.6}" rx="3" ry="1.8" fill="#6A70D8" opacity=".45"/></g>`;
  }
  const dy = k === "bean" ? -7 : k === "sesame" ? -2 : k === "grape" ? -8 : 0;
  return `<g${cls}><ellipse cx="${x}" cy="${y + dy + 1}" rx="7.6" ry="5.4" fill="#000" opacity=".18"/><ellipse cx="${x}" cy="${y + dy}" rx="7" ry="5" fill="url(#${ns}io)" stroke="#7A4E0E" stroke-width=".6" opacity=".95"/><ellipse cx="${x - 2.2}" cy="${y + dy - 1.8}" rx="2" ry="1.1" fill="#FFF3D6" opacity=".7"/></g>`;
}

export const g2u5StoreLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G5Step;
  const lab = g5Lab(host, api, s, { steps: 2, cls: "g2u5x-store", wait: "다섯 작물을 모두 검사해 보세요" });
  const { f } = lab;
  const A = newNs("so");
  const ly = g5Layers(lab, "접시에 놓인 다섯 가지 작물 조각과 아이오딘 용액", ["defs", "tray", "react", "text", "drop"]);
  ly.set("defs", `<defs>${labDefs(A)}${cropDefs(A)}</defs>`);
  const done = new Set<Crop>();
  let last: Crop | null = null;

  const X = (i: number): number => 39 + i * 67;
  ly.set(
    "tray",
    // 유리 쟁반과 작물 다섯
    `<rect x="6" y="50" width="334" height="80" rx="16" fill="rgba(200,225,255,.07)" stroke="#9CB4D6" stroke-width="1.6"/><path d="M20 55 L326 55" stroke="#DCEBFF" stroke-width="1.2" opacity=".35"/><path d="M14 122 Q173 132 332 122" stroke="#9CB4D6" stroke-width="1" fill="none" opacity=".5"/>` +
      ORDER.map((k, i) => cropArt(A, k, X(i), 88)).join(""),
  );
  const draw = (): void => {
    ly.set("react", ORDER.filter((k) => done.has(k)).map((k) => reaction(A, k, X(ORDER.indexOf(k)), 88, last === k)).join(""));
    let out = "";
    ORDER.forEach((k, i) => {
      const c = CROP[k];
      const x = X(i);
      out += txt(x, 148, c.name, { size: 13, fill: "#E8EEF9", weight: 800 }) + txt(x, 164, c.part, { size: 12, fill: P.dim });
      if (done.has(k)) out += txt(x, 188, c.starch ? "청람색" : "변화 없음", { size: 12, fill: c.starch ? "#A9B0FF" : "#E3C27A" }) + txt(x, 208, c.starch ? "녹말" : "녹말 아님", { size: 13, fill: "#fff", weight: 800 });
    });
    ly.set("text", out);
    if (last) {
      const x = X(ORDER.indexOf(last));
      ly.set("drop", `<g class="g2u5x-pop">${dropper(A, x, 52, false)}</g>`);
    } else ly.set("drop", tag(173, 30, "갈색 아이오딘 용액을 떨어뜨려요", { size: 12 }));
    host.dataset.g5Done = String(done.size);
  };

  const chips = ORDER.map((k) =>
    chip(k, CROP[k].name, "", () => {
      const c = CROP[k];
      last = k;
      if (done.has(k)) {
        tap();
        draw();
        return;
      }
      done.add(k);
      chips[ORDER.indexOf(k)].done();
      draw();
      if (c.starch) {
        good();
        f.say(`${c.name}는 <b>청람색</b>으로 변했어요. ${c.part}에 녹말이 저장돼 있어요.`);
      } else {
        tap();
        f.say(`색이 변하지 않아요. 녹말이 아니에요. ${c.name}${k === "bean" ? "은" : "는"} 주로 <b>${c.form}</b>${k === "bean" ? "로" : "으로"} 저장해요.`);
      }
      if (done.size === 5) {
        f.pips(1);
        go.disabled = false;
      }
    }),
  );
  const go = bvBtn("main g2u5x-go", "다섯 작물 비교하기");
  go.disabled = true;
  go.addEventListener("click", () => {
    tap();
    lab.judge("색이 <b>변하지 않은</b> 포도, 콩, 깨에 대해 알맞은 것은?", [{ t: "녹말이 아닌 양분을 저장한다", ok: true }, { t: "양분을 저장하지 않는다" }, { t: "녹말을 가장 많이 저장한다" }], "이 용액은 <b>녹말</b>만 찾아내요.", () =>
      lab.finish("식물은 양분을 <b>녹말</b>로만 저장하지 않아요. 포도는 주로 <b>포도당</b>, 콩은 <b>단백질</b>, 깨는 <b>지방</b>으로 저장해요."),
    );
  });
  f.slot.setControls(row(chips[0].el, chips[1].el, chips[2].el), row(chips[3].el, chips[4].el), go);
  draw();
  f.say("이 용액은 <b>녹말</b>을 만나면 청람색이 돼요. 작물마다 떨어뜨려 보세요.");
  return lab.cleanup;
};
