// [중2 Ⅱ v5] g2u2l6 랩 1, 2: 암석 분류와 암석의 순환.
//
// 랩 1 「이 암석은 어떻게 만들어졌을까요?」(g2u2RockIdLab)
//   책의 탐구(암석을 관찰하여 분류하기: 화강암, 현무암, 역암, 사암, 편마암, 대리암 / 돋보기, 묽은 염산)를 한다.
//   학생이 정하는 것: 볼 표본과 차례, 쓸 도구(돋보기, 묽은 염산), 넣을 갈래(화성암, 퇴적암, 변성암).
//   실패가 보이는 길: 관찰하지 않고는 갈래를 정할 수 없다. 틀린 갈래에 넣으면 들어가지 않고 무엇을 더 봐야 하는지 나온다
//   (대리암은 돋보기만으로는 화강암과 헷갈린다. 묽은 염산을 떨어뜨려야 가려진다).
//   판정 하나: 밝은 대리암을 가려낸 것. 통찰 하나: 암석의 특징이 만들어진 과정을 알려 준다.
//
// 랩 2 「암석은 어떤 길로 다른 암석이 될까요?」(g2u2CycleLab)
//   책의 그림(암석의 순환)을 길 찾기로 한다. 무대에 마그마, 화성암, 퇴적물, 퇴적암, 변성암 다섯 자리가 있다.
//   학생이 정하는 것: 지금의 암석에 일어날 일(부서진다, 다져지고 굳는다, 열과 압력을 받는다, 녹는다, 식어서 굳는다)과 차례.
//   실패가 보이는 길: 지금 상태에서 일어날 수 없는 일을 고르면 움직이지 않고 까닭이 나온다.
//   과제 둘: 화성암에서 퇴적암까지, 그 퇴적암에서 다시 화성암까지. 판정 하나: 퇴적암 속 화성암 조각이 거친 길.

import type { StepRenderer } from "../../types";
import { G, gGrid, gLab, gPick, gRow, gTap, geo, haptic, HAPTIC, josa, label, specimen, svgOpen, gBtn, type GStep } from "./kit";

/* ══════════ 랩 1: 암석 표본 여섯 개 ══════════ */
type Kind = "ign" | "sed" | "met";
const KIND: Record<Kind, string> = { ign: "화성암", sed: "퇴적암", met: "변성암" };
const SPEC: { k: string; name: string; img: string; kind: Kind; look: [string, string]; acid: boolean; hint: string }[] = [
  { k: "granite", name: "화강암", img: "rocks/granite.webp", kind: "ign", look: ["밝고, 큰 광물 결정이", "빈틈없이 맞물려 있다"], acid: false, hint: "큰 결정이 맞물려 있어요. 마그마가 천천히 식은 암석이에요." },
  { k: "conglomerate", name: "역암", img: "rocks/conglomerate.webp", kind: "sed", look: ["둥근 자갈이", "많이 박혀 있다"], acid: false, hint: "자갈이 박혀 있어요. 퇴적물이 쌓여 굳은 암석이에요." },
  { k: "gneiss", name: "편마암", img: "rocks/gneiss.webp", kind: "met", look: ["어두운 줄과 밝은 줄이", "번갈아 나타난다"], acid: false, hint: "굵은 줄무늬가 뚜렷해요. 열과 압력을 받아 생긴 줄무늬예요." },
  { k: "basalt", name: "현무암", img: "rocks/basalt.webp", kind: "ign", look: ["어둡고, 결정이 아주 작다", "표면에 구멍이 있다"], acid: false, hint: "결정이 아주 작아요. 마그마가 빨리 식은 암석이에요." },
  { k: "sandstone", name: "사암", img: "rocks/sandstone.webp", kind: "sed", look: ["모래 알갱이가", "뭉쳐서 굳어 있다"], acid: false, hint: "모래 알갱이가 보여요. 퇴적물이 쌓여 굳은 암석이에요." },
  { k: "marble", name: "대리암", img: "rocks/marble.webp", kind: "met", look: ["밝고 줄무늬가 없다", "결정이 맞물려 있다"], acid: true, hint: "묽은 염산을 떨어뜨려 보세요. 석회암이 변한 암석이라면 거품이 나요." },
];

export const g2u2RockIdLab: StepRenderer = (host, step, api) => {
  const lab = gLab(host, api, step as unknown as GStep, { steps: 3, cls: "g2u2x-rid" });
  const { f, tm } = lab;
  f.stage.innerHTML = `${svgOpen}
    <g class="g2u2x-ri-img"></g>
    ${label(72, 158, "표본을 골라 보세요", { size: 13.5, cls: "g2u2x-ri-name" })}
    ${label(146, 34, "돋보기로 본 모습", { anchor: "start", size: 12, fill: G.dim, weight: 600 })}
    ${label(146, 54, "", { anchor: "start", size: 13, cls: "g2u2x-ri-l1" })}${label(146, 73, "", { anchor: "start", size: 13, cls: "g2u2x-ri-l2" })}
    ${label(146, 100, "묽은 염산을 떨어뜨리면", { anchor: "start", size: 12, fill: G.dim, weight: 600 })}
    ${label(146, 120, "", { anchor: "start", size: 13, cls: "g2u2x-ri-l3" })}
    <g class="g2u2x-ri-bub"></g>
    ${(["ign", "sed", "met"] as Kind[]).map((k, i) => `${label(14, 186 + i * 17, `${KIND[k]}:`, { anchor: "start", size: 12.5, fill: G.dim, weight: 700 })}${label(66, 186 + i * 17, "", { anchor: "start", size: 12.5, fill: G.gold, cls: `g2u2x-ri-bin b-${k}` })}`).join("")}
  </svg>`;
  const tx = (c: string): SVGTextElement => lab.q<SVGTextElement>(`.g2u2x-ri-${c}`);
  let sel = -1;
  const looked = new Set<string>(), dropped = new Set<string>(), done = new Set<string>();
  const bins: Record<Kind, string[]> = { ign: [], sed: [], met: [] };
  const lens = gTap(lab, "lens", "돋보기로 보기", 300, 150, 76, 48);
  const acid = gTap(lab, "acid", "묽은 염산 떨어뜨리기", 216, 150, 76, 48);
  lens.classList.add("g2u2x-ri-tool");
  acid.classList.add("g2u2x-ri-tool");
  lens.textContent = "돋보기";
  acid.textContent = "묽은 염산";
  const picks = SPEC.map((s, i) => {
    const p = gPick(s.k, `표본 ${i + 1}`, "", `<img src="${geo(s.img)}" alt="">`);
    p.el.addEventListener("click", () => choose(i));
    return p;
  });
  const kinds = (["ign", "sed", "met"] as Kind[]).map((k) => {
    const b = gBtn(k, KIND[k], false);
    b.addEventListener("click", () => put(k, b));
    return b;
  });
  const show = (): void => {
    const s = SPEC[sel];
    const L = looked.has(s.k), D = dropped.has(s.k);
    tx("l1").textContent = L ? s.look[0] : "아직 보지 않았어요";
    tx("l2").textContent = L ? s.look[1] : "";
    tx("l1").setAttribute("fill", L ? G.text : G.dim);
    tx("l3").textContent = D ? (s.acid ? "거품이 난다" : "변화가 없다") : "아직 해 보지 않았어요";
    tx("l3").setAttribute("fill", D ? (s.acid ? G.gold : G.text) : G.dim);
    lab.q(".g2u2x-ri-bub").innerHTML = D && s.acid ? [0, 1, 2, 3].map((n) => `<circle class="g2u2x-mn-bub" style="animation-delay:${n * 0.14}s" cx="${46 + n * 16}" cy="${70 - (n % 2) * 10}" r="${4 + (n % 2)}" fill="rgba(255,255,255,.9)"/>`).join("") : "";
    kinds.forEach((b) => (b.disabled = !L));
  };
  const hintNow = (): void => {
    if (sel < 0 || done.has(SPEC[sel].k)) {
      const n = SPEC.findIndex((s) => !done.has(s.k));
      if (n >= 0) lab.hint(SPEC[n].k);
      return;
    }
    const s = SPEC[sel];
    if (!looked.has(s.k)) lab.hint("lens");
    else if (s.acid && !dropped.has(s.k)) lab.hint("acid");
    else lab.hint(s.kind);
  };
  function choose(i: number): void {
    if (done.has(SPEC[i].k) || lab.finished()) return;
    haptic(HAPTIC.tap);
    sel = i;
    picks.forEach((p, j) => p.on(j === i));
    lab.q(".g2u2x-ri-img").innerHTML = specimen("g2riA", SPEC[i].img, 12, 16, 120, 126, 14);
    tx("name").textContent = `표본 ${i + 1}`;
    show();
    f.say("<b>돋보기</b>나 <b>묽은 염산</b>으로 표본을 살펴본 뒤 어떻게 만들어진 암석인지 골라 보세요.");
    hintNow();
  }
  lens.addEventListener("click", () => {
    if (sel < 0) return;
    haptic(HAPTIC.tap);
    looked.add(SPEC[sel].k);
    show();
    hintNow();
  });
  acid.addEventListener("click", () => {
    if (sel < 0) return;
    haptic(HAPTIC.tap);
    dropped.add(SPEC[sel].k);
    show();
    hintNow();
  });
  function put(k: Kind, b: HTMLButtonElement): void {
    if (sel < 0 || lab.finished()) return;
    const s = SPEC[sel];
    if (done.has(s.k)) return;
    if (k !== s.kind) {
      haptic(HAPTIC.wrong);
      host.dataset.g2Miss = String(Number(host.dataset.g2Miss ?? 0) + 1);
      b.classList.remove("g2u2x-shake");
      void b.offsetWidth;
      b.classList.add("g2u2x-shake");
      f.say(`${KIND[k]}이 아니에요. ${s.hint}`);
      return;
    }
    haptic(HAPTIC.correct);
    done.add(s.k);
    bins[k].push(s.name);
    lab.q<SVGTextElement>(`.b-${k}`).textContent = bins[k].join(", ");
    tx("name").textContent = s.name;
    picks[sel].done();
    picks[sel].el.disabled = true;
    picks[sel].on(false);
    kinds.forEach((x) => (x.disabled = true));
    f.pips(done.size >= 3 ? 1 : 0);
    if (done.size < SPEC.length) {
      f.say(`맞아요. 이 표본은 <b>${s.name}</b>이에요. ${s.hint.split(". ")[1] ?? ""} 다음 표본을 골라 보세요.`);
      sel = -1;
      hintNow();
      return;
    }
    f.pips(2);
    f.say("여섯 표본을 모두 분류했어요. 기록을 떠올리며 답해 보세요.");
    tm.later(() => lab.ask("밝은 <b>대리암</b>을 화강암과 가려내 준 것은?", ["묽은 염산에 생긴 거품", "암석의 밝은 색", "표본의 크기"], "대리암은 석회암이 변한 암석이라 <b>묽은 염산</b>과 반응해 거품이 나요.", () =>
      lab.finish("암석은 <b>만들어진 과정</b>에 따라 화성암, 퇴적암, 변성암으로 나눠요. 맞물린 결정, 퇴적물 알갱이, 줄무늬, 염산과의 반응 같은 특징이 그 암석이 만들어진 과정을 알려 줘요."),
    ), 900);
  }
  f.slot.setControls(gGrid(3, ...picks), gRow(...kinds));
  kinds.forEach((b) => (b.disabled = true));
  f.say("이름표 없는 암석 표본이 여섯 개 있어요. <b>표본을 하나 골라</b> 살펴보세요.");
  api.setCTA("여섯 표본을 분류해 보세요", { enabled: false });
  hintNow();
  return lab.cleanup;
};

/* ══════════ 랩 2: 암석의 순환 길 찾기 ══════════ */
type Node = "ign" | "sedi" | "sed" | "met" | "mag";
type Proc = "break" | "pack" | "heat" | "melt" | "cool";
const NODE: Record<Node, { name: string; x: number; y: number; c: string }> = {
  sedi: { name: "퇴적물", x: 96, y: 54, c: "#E2B85A" },
  sed: { name: "퇴적암", x: 250, y: 54, c: "#C9A27A" },
  ign: { name: "화성암", x: 52, y: 130, c: "#9AA5B1" },
  met: { name: "변성암", x: 294, y: 130, c: "#B197FC" },
  mag: { name: "마그마", x: 173, y: 200, c: "#FF7A45" },
};
const PROC: Record<Proc, { name: string; sub: string }> = {
  break: { name: "부서진다", sub: "잘게 부서지고 깎임" },
  pack: { name: "다져지고 굳는다", sub: "쌓여서 눌림" },
  heat: { name: "열과 압력", sub: "땅속 깊은 곳" },
  melt: { name: "녹는다", sub: "더 높은 열" },
  cool: { name: "식어서 굳는다", sub: "마그마가 식음" },
};
const GO: Record<Node, Partial<Record<Proc, Node>>> = {
  ign: { break: "sedi", heat: "met", melt: "mag" },
  sedi: { pack: "sed" },
  sed: { break: "sedi", heat: "met", melt: "mag" },
  met: { break: "sedi", melt: "mag" },
  mag: { cool: "ign" },
};
const NO: Record<Node, string> = {
  ign: "화성암은 이미 굳은 암석이에요. 부서지거나, 열과 압력을 받거나, 녹을 수 있어요.",
  sedi: "퇴적물은 낱낱의 알갱이예요. 먼저 쌓여서 다져지고 굳어야 암석이 돼요.",
  sed: "퇴적암은 이미 굳은 암석이에요. 부서지거나, 열과 압력을 받거나, 녹을 수 있어요.",
  met: "이미 열과 압력을 받은 변성암이에요. 부서지거나, 더 높은 열에 녹을 수 있어요.",
  mag: "마그마는 녹아 있는 상태예요. 식어서 굳어야 암석이 돼요.",
};
const VERB: Record<Proc, string> = { break: "부서지고 깎여", pack: "다져지고 굳어", heat: "열과 압력을 받아", melt: "녹아", cool: "식어서 굳어" };
const TASK: { from: Node; to: Node; say: string; path: Proc[] }[] = [
  { from: "ign", to: "sed", say: "금빛 자리가 지금의 암석이에요. 아래에서 <b>일어날 일</b>을 골라 화성암을 퇴적암으로 바꿔 보세요.", path: ["break", "pack"] },
  { from: "sed", to: "ign", say: "이번에는 그 <b>퇴적암</b>이 다시 <b>화성암</b>이 되는 길을 찾아보세요.", path: ["melt", "cool"] },
];

export const g2u2CycleLab: StepRenderer = (host, step, api) => {
  const lab = gLab(host, api, step as unknown as GStep, { steps: 3, cls: "g2u2x-cycle" });
  const { f, tm } = lab;
  const edges: [Node, Node][] = [];
  (Object.keys(GO) as Node[]).forEach((a) => Object.values(GO[a]).forEach((b) => edges.push([a, b as Node])));
  const line = (a: Node, b: Node): string => {
    const A = NODE[a], B = NODE[b];
    const dx = B.x - A.x, dy = B.y - A.y, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
    const off = edges.some(([p, q]) => p === b && q === a) ? 5 : 0; // 오가는 길이 둘이면 나란히 벌린다
    const x1 = A.x + ux * 34 - uy * off, y1 = A.y + uy * 20 + ux * off, x2 = B.x - ux * 38 - uy * off, y2 = B.y - uy * 22 + ux * off;
    return `<g class="g2u2x-cy-e e-${a}-${b}"><path d="M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}"/><path d="M${(x2 - ux * 8 - uy * 5).toFixed(1)} ${(y2 - uy * 8 + ux * 5).toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)} L${(x2 - ux * 8 + uy * 5).toFixed(1)} ${(y2 - uy * 8 - ux * 5).toFixed(1)}"/></g>`;
  };
  f.stage.innerHTML = `${svgOpen}
    ${edges.map(([a, b]) => line(a, b)).join("")}
    ${(Object.keys(NODE) as Node[]).map((n) => `<g class="g2u2x-cy-n n-${n}"><rect x="${NODE[n].x - 36}" y="${NODE[n].y - 16}" width="72" height="32" rx="16" fill="rgba(11,21,36,.92)" stroke="${NODE[n].c}" stroke-width="2"/>${label(NODE[n].x, NODE[n].y + 5, NODE[n].name, { size: 13.5, fill: NODE[n].c })}</g>`).join("")}
    ${label(173, 22, "", { size: 13, fill: G.gold, cls: "g2u2x-cy-goal" })}
  </svg>`;
  let task = 0;
  let cur: Node = "ign";
  let trail: string[] = [];
  let busy = false;
  const mark = (): void => {
    lab.qa(".g2u2x-cy-n").forEach((g) => g.classList.toggle("now", g.classList.contains(`n-${cur}`)));
    lab.q<SVGTextElement>(".g2u2x-cy-goal").textContent = `목표: ${NODE[TASK[task].from].name}에서 ${NODE[TASK[task].to].name}까지`;
    host.dataset.g2Cur = cur;
  };
  const hintNow = (): void => {
    // 바른 길: 지금 자리에서 목표로 가는 가장 짧은 길의 첫걸음
    const want = TASK[task].to;
    const seenN = new Set<Node>([cur]);
    let frontier: { n: Node; first: Proc | null }[] = [{ n: cur, first: null }];
    while (frontier.length) {
      const next: typeof frontier = [];
      for (const it of frontier) {
        for (const [p, n] of Object.entries(GO[it.n]) as [Proc, Node][]) {
          if (seenN.has(n)) continue;
          seenN.add(n);
          const first = it.first ?? p;
          if (n === want) { lab.hint(first); return; }
          next.push({ n, first });
        }
      }
      frontier = next;
    }
  };
  const picks = (Object.keys(PROC) as Proc[]).map((p) => {
    const pk = gPick(p, PROC[p].name, PROC[p].sub);
    pk.el.addEventListener("click", () => go(p, pk.el));
    return pk;
  });
  function go(p: Proc, btn: HTMLButtonElement): void {
    if (busy || lab.finished()) return;
    const to = GO[cur][p];
    if (!to) {
      haptic(HAPTIC.wrong);
      host.dataset.g2Miss = String(Number(host.dataset.g2Miss ?? 0) + 1);
      btn.classList.remove("g2u2x-shake");
      void btn.offsetWidth;
      btn.classList.add("g2u2x-shake");
      f.say(NO[cur]);
      return;
    }
    haptic(HAPTIC.tap);
    lab.q(`.e-${cur}-${to}`).classList.add("on");
    if (!trail.length) trail.push(NODE[cur].name);
    trail.push(NODE[to].name);
    if (trail.length > 4) trail = ["…", ...trail.slice(-3)];
    cur = to;
    mark();
    if (cur !== TASK[task].to) {
      f.say(`${VERB[p]} <b>${NODE[cur].name}</b>${josa(NODE[cur].name, "이", "가")} 됐어요. 다음에는 무슨 일이 일어나야 할까요?`);
      hintNow();
      return;
    }
    haptic(HAPTIC.correct);
    busy = true;
    f.pips(task + 1);
    if (task === 0) {
      f.say("화성암이 부서져 퇴적물이 되고, 다져지고 굳어 <b>퇴적암</b>이 됐어요.");
      tm.later(() => {
        task = 1;
        trail = [];
        busy = false;
        mark();
        f.say(TASK[1].say);
        hintNow();
      }, 1600);
      return;
    }
    f.say("퇴적암이 돌고 돌아 다시 <b>화성암</b>이 됐어요. 길은 하나가 아니에요.");
    tm.later(() => lab.ask("화성암 조각이 <b>퇴적암 속에 들어가기까지</b> 거친 일은?", ["부서진 뒤 쌓여 다져졌다", "녹았다가 식어서 굳었다", "열과 압력만 받았다"], "화성암이 <b>부서져</b> 퇴적물이 되고, 그 퇴적물이 <b>다져져</b> 퇴적암이 돼요.", () =>
      lab.finish("암석은 만들어진 그대로 있지 않아요. 부서지고, 다져지고, 열과 압력을 받고, 녹고, 식으면서 <b>끊임없이 다른 암석으로</b> 변해요. 어떤 암석이든 환경이 바뀌면 다른 암석이 될 수 있어요."),
    ), 1200);
  }
  mark();
  f.slot.setControls(gGrid(2, ...picks));
  f.say(TASK[0].say);
  api.setCTA("암석이 변하는 길을 찾아보세요", { enabled: false });
  hintNow();
  return lab.cleanup;
};
