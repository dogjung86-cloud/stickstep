// [중2 Ⅴ v5] 아이오딘 아이오딘화 칼륨 용액을 쓰는 랩 두 판(g2u5l2, g2u5l6).
//
// g2u5StarchLab 「빛을 받은 잎에만 무엇이 생길까요?」 (g2u5l2)
//   책의 탐구 2: 상추 모종 둘 가운데 하나에만 어둠상자를 씌워 하루 둔다 → 잎 조각을 에탄올에 넣고 뜨거운 물에 담가 탈색한다
//   → 증류수로 헹군다 → 아이오딘 아이오딘화 칼륨 용액을 떨어뜨린다. 빛을 받은 잎 조각만 청람색이 된다.
//   학생이 정하는 것: 어둠상자를 씌울지, 에탄올을 데우는 방법, 처리의 차례.
//   실패하는 길: ① 어둠상자 없이 두면 두 조각이 모두 청람색이라 견줄 수 없다(처음부터 다시)
//               ② 탈색하지 않고 용액을 떨어뜨리면 초록색에 가려 색 변화가 보이지 않는다(새 조각으로 다시)
//               ③ 알코올램프 불로 직접 데우려 하면 위험하다고 막는다 ④ 헹구지 않으면 용액을 떨어뜨릴 수 없다.
//
// g2u5StoreLab 「저장된 양분은 모두 녹말일까요?」 (g2u5l6)
//   책의 그림(작물마다 다른 저장 형태)을 같은 용액으로 확인한다. 학생이 정하는 것: 용액을 떨어뜨릴 작물.
//   고구마와 감자는 청람색, 포도와 콩과 깨는 변화가 없다(녹말이 아닌 형태로 저장한다).

import type { StepRenderer } from "../../types";
import { P, bad, bvBtn, chip, g5Lab, g5Svg, good, lettuce, row, tag, tap, toast, txt, type G5Step } from "./kit";

const IODINE = "#C58A2E";
const BLUE = "#2B2F8A";

// ── 탐구 2: 잎의 녹말 확인 ──────────────────────────────────────────
type Piece = "fresh" | "pale" | "mud" | "blue" | "tan";
const PIECE: Record<Piece, { fill: string; edge: string }> = {
  fresh: { fill: "#3FA35B", edge: "#1F6B3A" },
  pale: { fill: "#F1EDCB", edge: "#B5AE7A" },
  mud: { fill: "#46532A", edge: "#2A3318" },
  blue: { fill: BLUE, edge: "#14164A" },
  tan: { fill: "#E3C27A", edge: "#A07C2E" },
};

export const g2u5StarchLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G5Step;
  const lab = g5Lab(host, api, s, { steps: 3, cls: "g2u5x-starch", wait: "실험을 차례대로 해 보세요" });
  const { f, tm } = lab;
  const stage = g5Svg(lab, "상추 모종 두 개와 어둠상자, 잎 조각을 처리하는 실험대");
  let phase: "prep" | "bench" = "prep";
  let box = false;
  let pale = false;
  let rinsed = false;
  let pieces: [Piece, Piece] = ["fresh", "fresh"];
  let busy = false;
  let flame = false;

  const dish = (cx: number, p: Piece, label: string, fx: string): string =>
    `${tag(cx, 132, label, { size: 12 })}<ellipse cx="${cx}" cy="184" rx="62" ry="19" fill="rgba(200,225,255,.10)" stroke="${P.glass}" stroke-width="1.8"/><ellipse cx="${cx}" cy="186" rx="52" ry="13" fill="rgba(200,225,255,.06)"/>
     <rect class="${fx}" x="${cx - 23}" y="162" width="46" height="30" rx="5" fill="${PIECE[p].fill}" stroke="${PIECE[p].edge}" stroke-width="1.5"/>${p === "fresh" || p === "pale" ? `<line x1="${cx - 18}" y1="177" x2="${cx + 18}" y2="177" stroke="${PIECE[p].edge}" stroke-width="1" opacity=".5"/>` : ""}`;
  const tube = (x: number): string =>
    `<path d="M${x - 7} 26 L${x - 7} 78 A7 7 0 0 0 ${x + 7} 78 L${x + 7} 26" fill="rgba(200,225,255,.08)" stroke="${P.glass}" stroke-width="1.6"/><path d="M${x - 5.5} 48 L${x - 5.5} 78 A5.5 5.5 0 0 0 ${x + 5.5} 78 L${x + 5.5} 48 Z" fill="${pale ? "rgba(90,190,110,.75)" : "rgba(235,240,250,.35)"}"/>`;
  const draw = (fx = ""): void => {
    if (phase === "prep") {
      stage.set(`
        <circle cx="173" cy="30" r="14" fill="${P.energy}" stroke="#B8860B" stroke-width="1.5"/>
        ${[0, 1, 2, 3, 4, 5, 6, 7].map((k) => `<line x1="${173 + Math.cos((k * Math.PI) / 4) * 19}" y1="${30 + Math.sin((k * Math.PI) / 4) * 19}" x2="${173 + Math.cos((k * Math.PI) / 4) * 25}" y2="${30 + Math.sin((k * Math.PI) / 4) * 25}" stroke="${P.energy}" stroke-width="2.4" stroke-linecap="round"/>`).join("")}
        <line x1="20" y1="192" x2="326" y2="192" stroke="#3B5273" stroke-width="2"/>
        ${lettuce(100, 190, 1.15)}${lettuce(246, 190, 1.15)}
        ${box ? `<rect class="g2u5x-pop" x="196" y="82" width="100" height="112" rx="6" fill="#141B2B" stroke="#55698A" stroke-width="2"/>${txt(246, 144, "어둠상자", { size: 13, fill: "#C6D3E6" })}` : ""}
        ${tag(100, 218, "모종 가", { size: 12 })}${tag(246, 218, "모종 나", { size: 12 })}
      `);
    } else {
      stage.set(`
        <rect x="126" y="40" width="94" height="58" rx="6" fill="rgba(255,150,110,.16)" stroke="${P.glass}" stroke-width="1.8"/>
        <rect x="128" y="56" width="90" height="40" rx="4" fill="rgba(255,140,100,.22)"/>
        ${tube(158)}${tube(188)}
        ${flame ? `<path class="g2u5x-blink" d="M173 122 C 163 110, 170 104, 173 96 C 176 104, 183 110, 173 122 Z" fill="#FF8A3C" stroke="#C4501A" stroke-width="1.2"/>` : ""}
        ${txt(118, 62, "에탄올", { anchor: "end", size: 12, fill: P.dim })}${txt(228, 80, "뜨거운 물", { anchor: "start", size: 12, fill: P.dim })}
        ${dish(92, pieces[0], "빛을 받은 잎", fx)}${dish(254, pieces[1], box ? "어둠상자 속 잎" : "빛을 받은 잎", fx)}
      `);
    }
    host.dataset.g5Stage = phase;
    host.dataset.g5Pieces = pieces.join(",");
  };

  // 준비: 어둠상자와 하루 두기
  const cBox = chip("box", "어둠상자", "씌우지 않음", () => {
    if (busy) return;
    tap();
    box = !box;
    cBox.on(box);
    cBox.sub(box ? "모종 나에 씌움" : "씌우지 않음");
    draw();
  });
  const day = bvBtn("main g2u5x-day", "햇빛이 드는 곳에 하루 두기");
  day.addEventListener("click", () => {
    if (busy) return;
    tap();
    phase = "bench";
    pale = false;
    rinsed = false;
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

function cropArt(k: Crop, x: number, y: number): string {
  if (k === "sweet") return `<ellipse cx="${x}" cy="${y}" rx="25" ry="22" fill="#F6DFA0" stroke="#8E3B6B" stroke-width="4"/>`;
  if (k === "potato") return `<ellipse cx="${x}" cy="${y}" rx="26" ry="21" fill="#F4EBCB" stroke="#B08A52" stroke-width="3"/>`;
  if (k === "grape") return `<circle cx="${x}" cy="${y}" r="22" fill="#CFE3A8" stroke="#5B3A8E" stroke-width="4"/><circle cx="${x - 6}" cy="${y - 2}" r="2.4" fill="#8C7A4A"/><circle cx="${x + 6}" cy="${y + 4}" r="2.4" fill="#8C7A4A"/>`;
  if (k === "bean") return `<ellipse cx="${x - 9}" cy="${y}" rx="13" ry="18" fill="#F0DFA8" stroke="#B59A4C" stroke-width="2"/><ellipse cx="${x + 11}" cy="${y + 2}" rx="13" ry="18" fill="#EBD79A" stroke="#B59A4C" stroke-width="2"/>`;
  return [[-12, -8], [2, -12], [14, -4], [-6, 4], [8, 8], [-14, 12], [0, 14]].map(([dx, dy], i) => `<ellipse cx="${x + dx}" cy="${y + dy}" rx="6" ry="4" fill="#E9D5A3" stroke="#A88A4E" stroke-width="1.2" transform="rotate(${i * 40} ${x + dx} ${y + dy})"/>`).join("");
}

export const g2u5StoreLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G5Step;
  const lab = g5Lab(host, api, s, { steps: 2, cls: "g2u5x-store", wait: "다섯 작물을 모두 검사해 보세요" });
  const { f } = lab;
  const stage = g5Svg(lab, "접시에 놓인 다섯 가지 작물 조각과 아이오딘 용액");
  const done = new Set<Crop>();
  let last: Crop | null = null;

  const X = (i: number): number => 39 + i * 67;
  const draw = (): void => {
    let out = `<rect x="6" y="52" width="334" height="74" rx="14" fill="rgba(200,225,255,.07)" stroke="${P.glass}" stroke-width="1.6"/>`;
    ORDER.forEach((k, i) => {
      const c = CROP[k];
      const x = X(i);
      out += cropArt(k, x, 89);
      if (done.has(k)) out += `<ellipse class="${last === k ? "g2u5x-pop" : ""}" cx="${x}" cy="89" rx="${c.starch ? 17 : 9}" ry="${c.starch ? 14 : 7}" fill="${c.starch ? BLUE : IODINE}" opacity="${c.starch ? ".95" : ".85"}"/>`;
      out += txt(x, 146, c.name, { size: 13, fill: "#E8EEF9", weight: 800 }) + txt(x, 162, c.part, { size: 12, fill: P.dim });
      if (done.has(k)) out += txt(x, 186, c.starch ? "청람색" : "변화 없음", { size: 12, fill: c.starch ? "#A9B0FF" : "#E3C27A" }) + txt(x, 206, c.form, { size: 13, fill: "#fff", weight: 800 });
    });
    if (last) {
      const x = X(ORDER.indexOf(last));
      out += `<g class="g2u5x-pop"><rect x="${x - 4}" y="12" width="8" height="26" rx="3" fill="rgba(200,225,255,.25)" stroke="${P.glass}" stroke-width="1.3"/><rect x="${x - 3}" y="22" width="6" height="15" rx="2" fill="${IODINE}"/><ellipse cx="${x}" cy="9" rx="7" ry="6" fill="#C0392B" stroke="#7A1F16" stroke-width="1.2"/><path d="M${x} 40 l-3 6 a3 3 0 0 0 6 0 Z" fill="${IODINE}"/></g>`;
    } else out += tag(173, 30, "갈색 아이오딘 용액을 떨어뜨려요", { size: 12 });
    stage.set(out);
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
        f.say(`${c.name}${k === "bean" ? "은" : "는"} 색이 변하지 않아요. 양분이 <b>${c.form}</b>${k === "bean" ? "로" : "으로"} 저장돼 있어요.`);
      }
      if (done.size === 5) {
        f.pips(1);
        go.disabled = false;
      }
    }),
  );
  const go = bvBtn("main g2u5x-go", "다섯 작물 견주기");
  go.disabled = true;
  go.addEventListener("click", () => {
    tap();
    lab.judge("색이 <b>변하지 않은</b> 포도, 콩, 깨에 대해 알맞은 것은?", [{ t: "녹말이 아닌 양분을 저장한다", ok: true }, { t: "양분을 저장하지 않는다" }, { t: "녹말을 가장 많이 저장한다" }], "이 용액은 <b>녹말</b>만 찾아내요.", () =>
      lab.finish("식물은 양분을 <b>녹말</b>로만 저장하지 않아요. 포도는 <b>포도당</b>, 콩은 <b>단백질</b>, 깨는 <b>지방</b>으로 저장해요."),
    );
  });
  f.slot.setControls(row(chips[0].el, chips[1].el, chips[2].el), row(chips[3].el, chips[4].el), go);
  draw();
  f.say("이 용액은 <b>녹말</b>을 만나면 청람색이 돼요. 작물마다 떨어뜨려 보세요.");
  return lab.cleanup;
};
