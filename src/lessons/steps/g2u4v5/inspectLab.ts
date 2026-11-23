// [중2 Ⅳ v5] 들여다보고 가르는 랩 두 판(같은 틀).
//   g2u4SortLab (g2u4l1) 「한 가지 성분으로만 이루어진 물질은 무엇일까요?」
//     활동(우리 주변의 물질 구분하기): 순금, 질소 기체, 네온, 얼음, 염화 칼슘의 성분을 살펴 가른다.
//   g2u4CanLab  (g2u4l5) 「우리 주변의 물질은 어떤 형태의 입자로 존재할까요?」(랩 이름은 앞 판에서 물려받았다)
//     활동(원자, 분자, 이온으로 존재하는 물질 알아보기): 구리선, 산소 기체, 이산화 탄소, 염화 나트륨을 이루는 입자를 가른다.
// 학생이 정하는 것: 어느 물질부터 볼지, 그리고 본 것을 어느 쪽으로 가를지. 잘못 가르면 그 자리에서 무엇을 다시 볼지 알려 준다.
// 판정의 근거(확대한 입자 모형과 성분 목록)는 무대에 남는다. 다 가르면 판정 질문 하나, 결론 한 문장.
// 판정이 뜨면 무대를 질문이 가리키는 것으로 바꾼다(마지막으로 가른 물질이 남아 질문과 어긋나지 않게):
//   성분 랩은 순금 확대와 성분 목록(금 하나), 입자 랩은 구리선과 염화 나트륨(소금 알갱이)의 확대 원 둘을 나란히.
import { el } from "../../../core/dom";
import { ELEMS } from "../../../ui/chemKit";
import type { StepRenderer } from "../../types";
import { bad, ball, bond, eul, eun, g4Lab, g4Svg, good, ida, row, tap, toast, txt, type G4Step } from "./kit";

interface Item {
  key: string;
  name: string;
  /** 확대 원 위의 이름(없으면 name) */
  title?: string;
  /** 확대한 입자 모형(원 안, 가운데 108,116 반지름 84) */
  art: string;
  /** 오른쪽 목록 */
  comps: [string, string][]; // [기호, 이름]
  bin: string;
  hint: string; // 잘못 갈랐을 때
}
interface Config {
  cls: string;
  wait: string;
  first: string;
  listTitle: string;
  bins: { key: string; label: string; short?: string }[]; // short: 무대 가운데 알림(토스트)에 쓰는 짧은 이름. 분류 버튼 이름이 길어 알림이 성분 이름표를 덮지 않게
  items: Item[];
  askBin: string; // 물질을 고른 뒤의 도움말
  /** 바르게 가른 뒤의 도움말(물질 이름과 분류함 이름을 받는다. 조사는 받침에 맞춘다) */
  right: (name: string, label: string) => string;
  /** 물질 칩 한 줄의 칸 수(기본 3). 이름이 긴 칩이 있으면 2 */
  chipCols?: 2 | 3;
  judge: { q: string; choices: { t: string; ok?: boolean }[]; why: string };
  /** 판정이 뜰 때 무대: 질문이 가리키는 물질 하나(item) 또는 직접 그린 장면(art, 무대의 id 접두를 받는다) */
  judgeShow: { item: string } | { art: (ns: string) => string };
  done: string;
}

// ── 입자 그림(좌표는 원의 가운데 108,116 기준으로 계산한다) ──
const CX = 108;
const CY = 116;
const grid = (sym: string, k: number, gap: number, rows = 4, cols = 4, cx = CX, cy = CY): string => {
  let out = "";
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++) {
      const x = cx + (i - (cols - 1) / 2) * gap;
      const y = cy + (j - (rows - 1) / 2) * gap;
      out += ball(x, y, sym, { k, label: false });
    }
  return out;
};
// 염화 나트륨 한 층: 나트륨 이온(Na⁺)과 염화 이온(Cl⁻)이 번갈아 놓인다. 원자일 때는 나트륨이 염소보다 크지만 이온이 되면
// 반대라서, 원자 공의 크기(chemKit)를 그대로 쓰지 않고 이온 반지름(Na⁺ 102 pm, Cl⁻ 181 pm, 염화 이온이 지름 약 1.8배)의 비로 잰다.
// 이웃한 두 이온의 중심 사이 gap(확대 원에서 30 px)에 반지름의 합 gap − 3 px(거의 맞닿게).
// 전하 표시는 글자 대신 굵은 선으로 긋는다(글자 '−'는 폰에서 1 px 남짓으로 가늘었다).
const ION_PM = { Na: 102, Cl: 181 } as const;
const sign = (x: number, y: number, plus: boolean, h: number): string => {
  const line = (x1: number, y1: number, x2: number, y2: number): string =>
    `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>`;
  return line(x - h, y, x + h, y) + (plus ? line(x, y - h, x, y + h) : "");
};
const salt = (cx = CX, cy = CY, gap = 30): string => {
  const px = (gap - 3) / (ION_PM.Na + ION_PM.Cl);
  let out = "";
  for (let j = 0; j < 4; j++)
    for (let i = 0; i < 4; i++) {
      const x = cx + (i - 1.5) * gap;
      const y = cy + (j - 1.5) * gap;
      const sym = (i + j) % 2 ? "Cl" : "Na";
      out += ball(x, y, sym, { k: (ION_PM[sym] * px) / ELEMS[sym].r, label: false }) + sign(x, y, sym === "Na", sym === "Na" ? 4.2 : 5.6);
    }
  return out;
};
// 두 원자 분자(질소 N₂, 산소 O₂): 같은 원자 둘이 결합한 덩이. 가운데 x, y, 기울기 a.
const pair = (sym: string, x: number, y: number, a: number): string => {
  const dx = Math.cos(a) * 11;
  const dy = Math.sin(a) * 11;
  return bond(x - dx, y - dy, x + dx, y + dy) + ball(x - dx, y - dy, sym, { k: 0.85, label: false }) + ball(x + dx, y + dy, sym, { k: 0.85, label: false });
};
// 기체 분자 다섯의 자리(가운데 사이 48 px 넘게, 확대 원 안쪽). 덩이 하나의 반지름은 22 px쯤이다
const GAS5: [number, number, number][] = [[72, 82, 0.3], [136, 70, -0.6], [150, 128, 0.9], [90, 138, -0.2], [120, 176, 0.5]];
// 얼음: 물 분자 일곱이 육각형 자리(가운데 하나, 둘레 여섯, 이웃 사이 46 px)에 가지런히 놓인다(확대 원 반지름 86 안)
const ice = (): string =>
  [[0, 0], ...[0, 1, 2, 3, 4, 5].map((i) => [Math.cos((i * Math.PI) / 3) * 46, Math.sin((i * Math.PI) / 3) * 46])]
    .map(([dx, dy], i) => water(CX + dx, CY + dy, i % 2 ? 0.5 : 3.6))
    .join("");
// 염화 칼슘: 칼슘과 염소가 1 : 2로 결합한 물질. 칼슘 자리(52 px 간격 3×3) 사이의 가로, 세로 가운데마다 염소를 둔다(평면 모형).
// 공 크기는 이온 반지름의 비(칼슘 100 pm, 염소 181 pm)로 잰다. 칼슘과 염소의 가운데 사이 26 px에 반지름의 합 24 px.
// 이 레슨은 아직 이온을 배우기 전이라 전하 표시는 하지 않는다(성분의 가짓수만 본다).
const cacl2 = (): string => {
  const px = 24 / (100 + 181);
  const kCl = (181 * px) / ELEMS.Cl.r;
  const kCa = (100 * px) / 16; // kit.ts의 칼슘 공 기준 반지름 16
  let out = "";
  // 확대 원 밖까지 같은 무늬로 깔고 원으로 자른다(칼슘 하나마다 오른쪽과 아래쪽에 염소가 하나씩, 그래서 1 : 2)
  for (let j = -2; j <= 2; j++)
    for (let i = -2; i <= 2; i++) {
      if (i < 2) out += ball(CX + i * 52 + 26, CY + j * 52, "Cl", { k: kCl, label: false });
      if (j < 2) out += ball(CX + i * 52, CY + j * 52 + 26, "Cl", { k: kCl, label: false });
    }
  for (let j = -2; j <= 2; j++) for (let i = -2; i <= 2; i++) out += ball(CX + i * 52, CY + j * 52, "Ca", { k: kCa, label: false });
  return out;
};
const co2 = (x: number, y: number, a: number): string => {
  const dx = Math.cos(a) * 21;
  const dy = Math.sin(a) * 21;
  return bond(x - dx, y - dy, x + dx, y + dy) + ball(x - dx, y - dy, "O", { k: 0.8, label: false }) + ball(x + dx, y + dy, "O", { k: 0.8, label: false }) + ball(x, y, "C", { k: 0.8, label: false });
};
const water = (x: number, y: number, a: number): string => {
  const p = (t: number): [number, number] => [x + Math.cos(a + t) * 15, y + Math.sin(a + t) * 15];
  const [x1, y1] = p(-0.91);
  const [x2, y2] = p(0.91);
  return bond(x, y, x1, y1) + bond(x, y, x2, y2) + ball(x1, y1, "H", { k: 0.9, label: false }) + ball(x2, y2, "H", { k: 0.9, label: false }) + ball(x, y, "O", { k: 0.95, label: false });
};

const SORT: Config = {
  cls: "g2u4x-sort",
  wait: "다섯 가지 물질을 모두 분류해 보세요",
  first: "아래에서 물질을 하나 골라 입자 모형을 <b>확대</b>해 보세요. 몇 가지 성분(원소)으로 이루어져 있나요?",
  listTitle: "물질을 이루는 성분",
  bins: [
    { key: "one", label: "성분이 한 가지인 물질", short: "성분이 한 가지" },
    { key: "many", label: "성분이 두 가지 이상인 물질", short: "성분이 두 가지 이상" },
  ],
  items: [
    { key: "au", name: "순금", art: grid("Au", 1, 30), comps: [["Au", "금"]], bin: "one", hint: "입자의 종류를 살펴보세요. 금(Au) 한 가지 성분으로만 이루어져 있어요" },
    { key: "ice", name: "얼음", art: ice(), comps: [["H", "수소"], ["O", "산소"]], bin: "many", hint: "수소와 산소, 두 가지 성분의 입자가 결합해 있어요" },
    { key: "n2", name: "질소 기체", art: GAS5.map(([x, y, a]) => pair("N", x, y, a)).join(""), comps: [["N", "질소"]], bin: "one", hint: "입자마다 원자 두 개가 결합해 있지만 둘 다 질소(N)예요. 성분은 한 가지뿐이에요" },
    { key: "cacl", name: "염화 칼슘", art: cacl2(), comps: [["Ca", "칼슘"], ["Cl", "염소"]], bin: "many", hint: "칼슘과 염소, 두 가지 성분이 결합해 있어요" },
    { key: "ne", name: "네온", title: "네온사인 속 네온", art: [[70, 80], [130, 64], [160, 118], [96, 126], [60, 160], [134, 168]].map(([x, y]) => ball(x, y, "Ne", { k: 1.3, label: false })).join(""), comps: [["Ne", "네온"]], bin: "one", hint: "입자는 여러 개이지만 성분의 종류는 네온(Ne) 한 가지뿐이에요" },
  ],
  askBin: "이 물질을 이루는 성분은 몇 가지인가요? 아래 분류 버튼에서 알맞은 쪽을 골라 보세요.",
  right: (name, label) => `맞아요! <b>${name}</b>${eun(name)} <b>${label}</b>${ida(label)}. 다음 물질도 골라 분류해 보세요.`,
  judge: {
    q: "금 한 가지 성분으로만 이루어진 <b>순금</b>을 더 간단한 다른 성분으로 분해할 수 있을까요?",
    choices: [{ t: "더 이상 다른 성분으로 분해할 수 없다", ok: true }, { t: "금과 산소 두 가지 성분으로 분해된다" }, { t: "높은 온도로 가열하면 여러 가지 성분으로 나뉜다" }],
    why: "이루고 있는 성분이 <b>금 한 가지뿐</b>이어서 더 이상 나누어질 다른 성분이 없기 때문이에요.",
  },
  judgeShow: { item: "au" },
  // "물질은"이 아니라 "순물질은": 성분이 두 가지 이상인 물질에는 혼합물도 있어서, 화합물과 같다고 하려면 순물질로 한정해야 한다
  done: "순물질은 이루는 성분이 <b>한 가지인 물질(원소)</b>과 <b>두 가지 이상인 물질(화합물)</b>로 나눌 수 있으며, 한 가지 성분으로 된 물질은 더 이상 다른 성분으로 분해되지 않아요.",
};

// 입자 랩의 판정 장면: 왼쪽 구리선, 오른쪽 염화 나트륨(소금 알갱이)의 확대 원을 나란히, 원 아래에 다른 점을 한 줄씩.
// 확대 원은 반지름 72(가운데 84,106과 262,106). 알갱이 사이를 25 px로 줄여 4×4가 원 안에 다 든다
// (모서리 알갱이 바깥 끝이 가운데에서 53 + 14 = 67 px, 자르는 원 70 px. 소금은 같은 이온 반지름 비 102 : 181).
const canPair = (ns: string): string => {
  const L = { x: 84, y: 106 };
  const R = { x: 262, y: 106 };
  const loupe = (c: { x: number; y: number }, id: string, art: string): string =>
    `<clipPath id="${ns}-${id}"><circle cx="${c.x}" cy="${c.y}" r="70"/></clipPath><circle cx="${c.x}" cy="${c.y}" r="72" fill="rgba(10,17,28,.6)" stroke="#2B3F5C" stroke-width="3"/><g clip-path="url(#${ns}-${id})" class="g2u4x-pop">${art}</g>`;
  return (
    loupe(L, "lpa", grid("Cu", 11.5 / 15, 25, 4, 4, L.x, L.y)) +
    loupe(R, "lpb", salt(R.x, R.y, 25)) +
    txt(L.x, 24, "구리선", { size: 13.5, fill: "#fff", weight: 800 }) +
    txt(R.x, 24, "염화 나트륨(소금 알갱이)", { size: 13.5, fill: "#fff", weight: 800 }) +
    txt(L.x, 197, "전하를 띠지 않음", { size: 13.5, fill: "#C6D3E6", weight: 800 }) +
    txt(R.x, 197, "(+), (−) 이온이 번갈아 배열", { size: 13.5, fill: "#FFE58A", weight: 800 })
  );
};

const CAN: Config = {
  cls: "g2u4x-can",
  wait: "네 가지 물질을 이루는 입자의 형태를 모두 분류해 보세요",
  first: "우리 주변의 네 가지 물질을 하나씩 골라 <b>확대</b>해 보세요. 각각 원자, 분자, 이온 중 어떤 형태의 입자로 이루어져 있나요?",
  listTitle: "물질을 이루는 성분",
  bins: [
    { key: "atom", label: "원자" },
    { key: "mol", label: "분자" },
    { key: "ion", label: "이온" },
  ],
  // 칩 이름 "염화 나트륨(소금)"이 세 칸 줄(한 칸 95px)에 들지 않아 두 칸 두 줄로 놓는다(칩 넷이라 줄 수는 그대로 둘).
  chipCols: 2,
  items: [
    { key: "cu", name: "구리선", art: grid("Cu", 1, 30), comps: [["Cu", "구리"]], bin: "atom", hint: "전하를 띠지 않는 구리 원자들이 규칙적으로 배열되어 있어요" },
    { key: "o2", name: "산소 기체", art: GAS5.map(([x, y, a]) => pair("O", x, y, a)).join(""), comps: [["O", "산소"]], bin: "mol", hint: "원자 2개가 결합한 독립된 입자(분자)들이 따로따로 떨어져 있어요" },
    {
      key: "salt",
      name: "염화 나트륨(소금)",
      title: "염화 나트륨(소금 알갱이)",
      art: salt(),
      comps: [["Na", "나트륨"], ["Cl", "염소"]],
      bin: "ion",
      hint: "입자마다 (+)전하와 (−)전하를 띤 이온 상태로 결합해 있어요",
    },
    { key: "co2", name: "이산화 탄소", art: co2(78, 76, 0.3) + co2(140, 96, -0.5) + co2(84, 140, -0.2) + co2(138, 160, 0.5), comps: [["C", "탄소"], ["O", "산소"]], bin: "mol", hint: "원자 3개가 결합하여 하나의 독립된 입자(분자)를 이루고 있어요" },
  ],
  askBin: "확대한 모형에서 이 물질을 이루는 기본 입자는 무엇인가요? 아래에서 골라 분류해 보세요.",
  right: (name, label) => `맞아요! <b>${name}</b>${eul(name)} 이루는 입자는 <b>${label}</b>${ida(label)}. 다음 물질도 골라 분류해 보세요.`,
  judge: {
    q: "구리선과 염화 나트륨은 모두 입자가 규칙적으로 배열되어 있어요. 두 물질을 이루는 입자의 <b>가장 큰 차이점</b>은 무엇인가요?",
    // 정답 보기는 "염화 나트륨을 이루는 입자는"을 "염화 나트륨 입자는"으로 줄였다(오답 카드의 정답 글이 두 줄이 되면 조작 칸 208px를 넘는다)
    choices: [{ t: "염화 나트륨 입자는 (+)와 (−) 전하를 띤 이온이다", ok: true }, { t: "염화 나트륨을 이루는 입자는 한 가지 종류뿐이다" }, { t: "구리선을 이루는 입자만 전하를 띠고 있다" }],
    why: "염화 나트륨은 (+)전하를 띤 <b>나트륨 이온(Na⁺)</b>과 (−)전하를 띤 <b>염화 이온(Cl⁻)</b>이 번갈아 규칙적으로 배열되어 있기 때문이에요.",
  },
  judgeShow: { art: canPair },
  done: "우리 주변의 물질을 이루는 입자는 물질의 종류에 따라 <b>원자</b>, <b>분자</b>, 또는 <b>이온</b>의 형태로 존재해요.",
};

const make =
  (cfg: Config): StepRenderer =>
  (host, step, api) => {
    const s = step as unknown as G4Step;
    const lab = g4Lab(host, api, s, { steps: cfg.items.length, cls: cfg.cls, wait: cfg.wait });
    const { f } = lab;
    const stage = g4Svg(lab, "확대해 본 물질의 입자 모형");
    let cur: Item | null = null;
    const doneKeys = new Set<string>();

    const draw = (): void => {
      if (!cur) {
        stage.set(`<circle cx="${CX}" cy="${CY}" r="88" fill="rgba(10,17,28,.6)" stroke="#2B3F5C" stroke-width="3"/>${txt(CX, CY + 5, "관찰할 물질을 골라 보세요", { size: 13.5 })}`);
        return;
      }
      const list = cur.comps.map(([sym, name], i) => ball(232, 84 + i * 30, sym, { k: 0.72, label: false }) + txt(250, 89 + i * 30, name, { anchor: "start", size: 14, fill: "#E8EEF9" })).join("");
      stage.set(`
        <defs><clipPath id="${stage.ns}-loupe"><circle cx="${CX}" cy="${CY}" r="86"/></clipPath></defs>
        <circle cx="${CX}" cy="${CY}" r="88" fill="rgba(10,17,28,.6)" stroke="#2B3F5C" stroke-width="3"/>
        <g clip-path="url(#${stage.ns}-loupe)" class="g2u4x-pop">${cur.art}</g>
        ${txt(108, 20, cur.title ?? cur.name, { size: 14, fill: "#fff", weight: 800 })}
        ${txt(222, 58, cfg.listTitle, { anchor: "start", size: 12.5, fill: "#8CA2C0" })}${list}
      `);
    };
    /** 판정이 뜰 때 무대를 질문이 가리키는 것으로 바꾼다. */
    const showJudge = (): void => {
      lab.f.stage.querySelector(".g2u4x-toast")?.remove(); // 마지막으로 가른 물질의 알림이 판정 장면을 가리지 않게
      const js = cfg.judgeShow;
      if ("item" in js) {
        cur = cfg.items.find((it) => it.key === js.item) ?? null;
        draw();
      } else stage.set(js.art(stage.ns));
      host.dataset.g4View = "judge";
    };

    const chips = cfg.items.map((it) => {
      const b = el("button", { class: "g2u4x-chipbtn", text: it.name, attrs: { type: "button" } }) as HTMLButtonElement;
      b.dataset.k = it.key;
      b.addEventListener("click", () => {
        if (doneKeys.has(it.key)) return;
        tap();
        cur = it;
        chips.forEach((c) => c.classList.toggle("on", c === b));
        bins.forEach((x) => (x.disabled = false));
        draw();
        f.say(cfg.askBin);
        host.dataset.g4Cur = it.key;
      });
      return b;
    });
    const bins = cfg.bins.map((bn) => {
      const b = el("button", { class: "bv-btn main g2u4x-bin", text: bn.label, attrs: { type: "button" } }) as HTMLButtonElement;
      b.dataset.k = bn.key;
      if (import.meta.env.DEV) b.dataset.bin = bn.key;
      b.disabled = true;
      b.addEventListener("click", () => {
        if (!cur) return;
        if (cur.bin !== bn.key) {
          bad();
          lab.slip();
          toast(lab, "다시 한번 살펴보세요", true);
          f.say(`${cur.hint}.`);
          host.dataset.g4Miss = String(Number(host.dataset.g4Miss ?? 0) + 1);
          return;
        }
        good();
        doneKeys.add(cur.key);
        const chip = chips.find((c) => c.dataset.k === cur?.key);
        chip?.classList.remove("on");
        chip?.classList.add("done");
        if (chip) chip.disabled = true;
        f.pips(doneKeys.size);
        toast(lab, `${cur.name}: ${bn.short ?? bn.label}`);
        bins.forEach((x) => (x.disabled = true));
        host.dataset.g4Done = String(doneKeys.size);
        if (doneKeys.size < cfg.items.length) {
          f.say(cfg.right(cur.name, bn.label));
          cur = null;
          return;
        }
        lab.tm.later(() => {
          showJudge();
          lab.judge(cfg.judge.q, cfg.judge.choices, cfg.judge.why, () => lab.finish(cfg.done));
        }, 900);
      });
      return b;
    });
    const chipBox = el("div", { class: `g2u4x-chipgrid${cfg.chipCols === 2 ? " two" : ""}` }, ...chips);
    if (import.meta.env.DEV) chips.forEach((c, i) => (c.dataset.bin = cfg.items[i].bin));
    f.slot.setControls(chipBox, row(...bins));
    draw();
    f.say(cfg.first);
    return lab.cleanup;
  };

export const g2u4SortLab = make(SORT);
export const g2u4CanLab = make(CAN);
