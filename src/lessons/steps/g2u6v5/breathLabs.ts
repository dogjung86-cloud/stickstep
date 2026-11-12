// [중2 Ⅵ v5] 호흡 랩 두 판(g2u6l4).
//
// g2u6ChestLab 「풍선은 어떻게 부풀까요?」
//   책의 해 보기 「호흡운동 모형 만들기」: 플라스틱 컵, 빨대, 작은 고무풍선 두 개, 고무 막, 컵과 빨대 사이의 틈을 막는 고무찰흙.
//   컵을 위로 올리면서 고무 막을 아래로 당길 때와, 컵을 내리면서 고무 막을 위로 올릴 때 작은 고무풍선의 변화를 본다.
//   학생이 정하는 것: 틈을 고무찰흙으로 막을지, 컵을 올릴지 내릴지, 고무 막을 당길지 밀어 올릴지.
//   실패하는 길: 틈을 막지 않으면 틈으로 공기가 드나들어 풍선이 변하지 않는다.
//
// g2u6GasLab 「산소와 이산화 탄소는 어느 쪽으로 이동할까요?」
//   책의 그림(허파꽈리와 조직세포에서의 기체 교환). 학생이 정하는 것: 허파꽈리와 조직세포에서 두 기체가 이동하는 방향.
//   거꾸로 고르면 건네줄 기체가 없어 교환이 일어나지 않는 것이 보인다.

import type { StepRenderer } from "../../types";
import { P, arrow, bad, bvBtn, chip, dot, g6Lab, g6Svg, good, row, tag, tap, toast, txt, type G6Step } from "./kit";

// ── 호흡운동 모형 ──────────────────────────────────────────────────
export const g2u6ChestLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G6Step;
  const lab = g6Lab(host, api, s, { steps: 3, cls: "g2u6x-chest", wait: "모형을 움직여 풍선을 부풀려 보세요" });
  const { f } = lab;
  const stage = g6Svg(lab, "플라스틱 컵 속에 작은 고무풍선 두 개가 빨대에 달려 있고 컵 아래에 고무 막을 씌운 호흡운동 모형");
  let sealed = false;
  let lift = 0; // 컵: 0 내림, 1 올림
  let pull = 0; // 고무 막: -1 밀어 올림, 0 그대로, 1 아래로 당김
  let lastMove: "" | "up" | "down" = "";
  let seenIn = false;
  let seenOut = false;

  const vol = (): number => lift + pull; // -1 ~ 2
  const draw = (): void => {
    const top = 62 - lift * 16;
    const bot = 176;
    const v = sealed ? vol() : 0;
    const r = 15 + v * 5.5;
    let out = "";
    // 빨대(위에서 들어와 두 갈래)
    out += `<path d="M173 ${top - 44} L173 ${top + 34} M173 ${top + 34} L150 ${top + 52} M173 ${top + 34} L196 ${top + 52}" fill="none" stroke="#9AD1F5" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`;
    // 작은 고무풍선 두 개
    [150, 196].forEach((x, i) => {
      const cx = x + (i ? 1 : -1) * (r * 0.35);
      out += `<ellipse cx="${cx}" cy="${top + 54 + r}" rx="${r * 0.82}" ry="${r}" fill="#F58CA0" stroke="#B4405A" stroke-width="1.8"/><ellipse cx="${cx - r * 0.3}" cy="${top + 54 + r * 0.7}" rx="${r * 0.18}" ry="${r * 0.3}" fill="#FFD1DA" opacity=".8"/>`;
    });
    // 컵(위쪽 몸통은 올라가고, 아래 고무 막 자리는 그대로)
    out += `<path d="M118 ${top} L228 ${top} L238 ${bot} L108 ${bot} Z" fill="rgba(200,225,255,.08)" stroke="${P.glass}" stroke-width="2"/>`;
    // 갈비뼈 붙임딱지
    [0, 1, 2].forEach((k) => {
      const y = top + 26 + k * 30;
      out += `<path d="M${116 - k * 1.5} ${y} q57 16 ${114 + k * 3} 0" fill="none" stroke="#E9EEF7" stroke-width="3" stroke-linecap="round" opacity=".5"/>`;
    });
    // 틈과 고무찰흙
    out += sealed ? `<ellipse cx="173" cy="${top}" rx="15" ry="6" fill="#F2B84B" stroke="#9A6A1C" stroke-width="1.4"/>` : `<ellipse cx="173" cy="${top}" rx="13" ry="4.5" fill="#0B1524" stroke="${P.bad}" stroke-width="1.6" stroke-dasharray="3 3"/>`;
    // 고무 막
    out += `<path d="M108 ${bot} Q173 ${bot + pull * 34} 238 ${bot}" fill="none" stroke="#C084FC" stroke-width="5" stroke-linecap="round"/>`;
    if (pull === 1) out += `<line x1="173" y1="${bot + 17}" x2="173" y2="${bot + 34}" stroke="#C084FC" stroke-width="3"/><circle cx="173" cy="${bot + 38}" r="5" fill="#C084FC"/>`;
    // 공기의 이동
    if (lastMove && sealed) out += lastMove === "up" ? arrow(173, top - 78, 173, top - 48, P.o2, 3.4, "g2u6x-pop") : arrow(173, top - 48, 173, top - 78, P.co2, 3.4, "g2u6x-pop");
    if (lastMove && !sealed) out += arrow(203, top - 20, 184, top - 3, P.bad, 2.6, "g2u6x-blink");
    // 이름표와 읽을 값
    out += tag(54, 34, "빨대", { size: 12 }) + tag(54, 104, "플라스틱 컵", { size: 12 }) + tag(54, 190, "고무 막", { size: 12 }) + tag(292, 126, "작은 고무풍선", { size: 12 });
    const vt = vol() > 0 ? "커짐" : vol() < 0 ? "작아짐" : "처음과 같음";
    const pt = !sealed ? "바깥과 같음" : lastMove === "up" ? "낮아짐" : lastMove === "down" ? "높아짐" : "바깥과 같음";
    out += txt(338, 30, `컵 속 부피: ${vt}`, { anchor: "end", size: 12, fill: P.hi }) + txt(338, 48, `컵 속 압력: ${pt}`, { anchor: "end", size: 12, fill: pt === "낮아짐" ? P.o2 : pt === "높아짐" ? P.co2 : P.dim });
    stage.set(out);
    host.dataset.g6Vol = String(vol());
    host.dataset.g6Sealed = sealed ? "1" : "0";
  };
  const go = bvBtn("main g2u6x-go", "알아낸 것 정리하기");
  go.disabled = true;
  const moved = (before: number): void => {
    const now = vol();
    if (now === before) return;
    lastMove = now > before ? "up" : "down";
    draw();
    if (!sealed) {
      bad();
      host.dataset.g6Fail = "leak";
      toast(lab, "풍선이 그대로예요", true);
      f.say("빨대 옆 <b>틈</b>으로 공기가 드나들어 풍선은 변하지 않아요. 틈을 막아요.");
      return;
    }
    host.dataset.g6Fail = "";
    good();
    if (lastMove === "up") {
      seenIn = true;
      f.say("컵 속 부피가 커져 압력이 <b>낮아졌어요</b>. 바깥 공기가 풍선으로 <b>들어와요</b>.");
    } else {
      seenOut = true;
      f.say("컵 속 부피가 작아져 압력이 <b>높아졌어요</b>. 풍선 속 공기가 밖으로 <b>나가요</b>.");
    }
    f.pips((seenIn ? 1 : 0) + (seenOut ? 1 : 0));
    go.disabled = !(seenIn && seenOut);
  };

  const cSeal = chip("seal", "틈 막기", "막지 않음", () => {
    tap();
    sealed = !sealed;
    cSeal.sub(sealed ? "고무찰흙으로 막음" : "막지 않음");
    cSeal.on(sealed);
    lastMove = "";
    lift = 0;
    pull = 0;
    cCup.on(false);
    cCup.name("컵 올리기");
    cPull.on(false);
    cPush.on(false);
    draw();
    f.say(sealed ? "틈을 막았어요. 이제 컵과 고무 막을 움직여 봐요." : "틈을 다시 열었어요.");
  });
  const cCup = chip("cup", "컵 올리기", "", () => {
    tap();
    const b = vol();
    lift = lift ? 0 : 1;
    cCup.on(!!lift);
    cCup.name(lift ? "컵 내리기" : "컵 올리기");
    moved(b);
  });
  const setPull = (v: number): void => {
    tap();
    const b = vol();
    pull = pull === v ? 0 : v;
    cPull.on(pull === 1);
    cPush.on(pull === -1);
    moved(b);
  };
  const cPull = chip("pull", "막 당기기", "아래로", () => setPull(1));
  const cPush = chip("push", "막 올리기", "위로", () => setPull(-1));
  go.addEventListener("click", () => {
    tap();
    lab.judge("고무 막을 아래로 당기면 풍선이 <b>부푸는</b> 까닭은?", [{ t: "컵 속 압력이 낮아져서", ok: true }, { t: "고무 막이 공기를 밀어 넣어서" }, { t: "풍선이 스스로 늘어나서" }], "컵 속 부피가 커지면 압력이 낮아져 <b>바깥 공기</b>가 들어와요.", () =>
      lab.finish("컵 속 <b>부피가 커지면</b> 압력이 낮아져 공기가 풍선으로 들어오고, <b>부피가 작아지면</b> 압력이 높아져 공기가 나가요. 풍선은 스스로 움직이지 않았어요."),
    );
  });
  f.slot.setControls(row(cSeal.el, cCup.el), row(cPull.el, cPush.el), go);
  draw();
  f.say("풍선에는 손을 대지 않아요. <b>컵</b>이나 <b>고무 막</b>을 움직여 풍선을 부풀려 봐요.");
  return lab.cleanup;
};

// ── 기체 교환 ──────────────────────────────────────────────────────
export const g2u6GasLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G6Step;
  const lab = g6Lab(host, api, s, { steps: 3, cls: "g2u6x-gas", wait: "두 곳에서 기체를 교환해 보세요" });
  const { f, tm } = lab;
  const stage = g6Svg(lab, "왼쪽에 허파꽈리, 오른쪽에 조직세포, 그 아래를 지나는 모세혈관과 적혈구");
  let site: "lung" | "cell" = "lung";
  let blood: "co2" | "o2" = "co2"; // 혈액이 많이 가진 기체
  let lungDone = false;
  let cellDone = false;
  let missAt = "";
  let busy = false;

  const draw = (): void => {
    let out = "";
    // 모세혈관
    out += `<rect x="14" y="150" width="318" height="40" rx="20" fill="${blood === "o2" ? "#5A2630" : "#3F2A4A"}" stroke="${blood === "o2" ? P.red : P.dark}" stroke-width="2"/>`;
    out += txt(173, 212, "모세혈관", { size: 12, fill: P.dim });
    // 허파꽈리
    out += `<circle cx="82" cy="80" r="52" fill="rgba(124,200,255,.10)" stroke="#9AD1F5" stroke-width="2"/>` + tag(82, 24, "허파꽈리", { size: 12 });
    // 조직세포
    out += `<rect x="212" y="34" width="112" height="92" rx="20" fill="rgba(240,140,90,.14)" stroke="#F0A070" stroke-width="2"/><circle cx="268" cy="82" r="13" fill="rgba(240,140,90,.35)" stroke="#F0A070" stroke-width="1.4"/>` + tag(268, 24, "조직세포", { size: 12 });
    // 허파꽈리 안의 기체
    const lungO2 = lungDone ? 2 : 6;
    for (let i = 0; i < lungO2; i++) out += dot(56 + (i % 3) * 26, 62 + Math.floor(i / 3) * 28, 6, P.o2, "#2F6FA8");
    if (lungDone) for (let i = 0; i < 4; i++) out += dot(60 + (i % 2) * 40, 96 + Math.floor(i / 2) * 18, 6, P.co2, "#6A55B8", "g2u6x-pop");
    // 조직세포 안의 기체
    const cellCo2 = cellDone ? 1 : 5;
    for (let i = 0; i < cellCo2; i++) out += dot(232 + (i % 3) * 30, 56 + Math.floor(i / 3) * 44, 6, P.co2, "#6A55B8");
    if (cellDone) for (let i = 0; i < 4; i++) out += dot(246 + (i % 2) * 44, 66 + Math.floor(i / 2) * 34, 6, P.o2, "#2F6FA8", "g2u6x-pop");
    // 적혈구와 혈액 속 기체
    const bx = site === "lung" ? 82 : 268;
    out += `<ellipse cx="${bx}" cy="170" rx="24" ry="13" fill="${blood === "o2" ? "#E8505B" : "#9C5A86"}" stroke="#fff" stroke-width="1.6"/>`;
    for (let i = 0; i < 4; i++) out += dot(bx - 15 + i * 10, 170, 4, blood === "o2" ? P.o2 : P.co2, blood === "o2" ? "#2F6FA8" : "#6A55B8");
    // 방금 일어난 이동
    if (lungDone && site === "lung") out += arrow(70, 122, 70, 152, P.o2, 3, "g2u6x-pop") + arrow(98, 152, 98, 122, P.co2, 3, "g2u6x-pop");
    if (cellDone && site === "cell") out += arrow(254, 152, 254, 124, P.o2, 3, "g2u6x-pop") + arrow(284, 124, 284, 152, P.co2, 3, "g2u6x-pop");
    if (missAt) out += `<g class="g2u6x-blink">${arrow(missAt === "lung" ? 82 : 268, 150, missAt === "lung" ? 82 : 268, 128, P.bad, 3)}</g>`;
    out += `<g>${dot(132, 222, 5, P.o2, "#2F6FA8")}${txt(141, 226, "산소", { anchor: "start", size: 12, fill: P.hi })}${dot(184, 222, 5, P.co2, "#6A55B8")}${txt(193, 226, "이산화 탄소", { anchor: "start", size: 12, fill: P.hi })}</g>`;
    stage.set(out);
    host.dataset.g6Site = site;
    host.dataset.g6Blood = blood;
  };

  const move = bvBtn("main g2u6x-move", "혈액을 조직세포로 보내기");
  const pick = (right: boolean): void => {
    if (busy) return;
    const here = site;
    if ((here === "lung" && lungDone) || (here === "cell" && cellDone)) return;
    if (!right) {
      bad();
      lab.slip();
      missAt = here;
      host.dataset.g6Fail = here;
      draw();
      toast(lab, "기체가 이동하지 않았어요", true);
      f.say(here === "lung" ? "허파에 막 도착한 혈액에는 건넬 <b>산소</b>가 적어요. 산소는 허파꽈리 쪽에 많아요." : "조직세포는 산소를 써 버려서 건넬 <b>산소</b>가 없어요. 세포에는 이산화 탄소가 많아요.");
      tm.later(() => {
        missAt = "";
        draw();
      }, 900);
      return;
    }
    good();
    host.dataset.g6Fail = "";
    if (here === "lung") {
      lungDone = true;
      blood = "o2";
      f.pips(1);
      draw();
      f.say("산소가 혈액으로 들어오고 이산화 탄소가 허파꽈리로 나갔어요. 혈액이 <b>선홍색</b>이 됐어요.");
      f.slot.setControls(move);
    } else {
      cellDone = true;
      blood = "co2";
      f.pips(2);
      draw();
      f.say("산소가 세포로 가고 이산화 탄소가 혈액으로 들어왔어요. 혈액이 다시 <b>어두워졌어요</b>.");
      busy = true;
      tm.later(() => {
        lab.judge("<b>허파꽈리</b>를 지나는 동안 혈액 속에서 늘어난 기체는?", [{ t: "산소", ok: true }, { t: "이산화 탄소" }, { t: "두 기체 모두" }], "허파꽈리에서 산소는 <b>혈액으로</b>, 이산화 탄소는 <b>허파꽈리로</b> 이동해요.", () =>
          lab.finish("허파꽈리에서는 <b>산소</b>가 혈액으로, 이산화 탄소가 허파꽈리로 이동해요. 조직세포에서는 산소가 세포로, <b>이산화 탄소</b>가 혈액으로 이동해요."),
        );
      }, 1800);
    }
  };
  const cGood = chip("in", "산소는 혈액으로", "이산화 탄소는 허파꽈리로", () => pick(site === "lung"));
  const cBadc = chip("out", "산소는 허파꽈리로", "이산화 탄소는 혈액으로", () => pick(false));
  const cCellGood = chip("cin", "산소는 조직세포로", "이산화 탄소는 혈액으로", () => pick(true));
  const cCellBad = chip("cout", "산소는 혈액으로", "이산화 탄소는 조직세포로", () => pick(false));
  [cGood, cBadc, cCellGood, cCellBad].forEach((c) => c.el.classList.add("wide"));
  move.addEventListener("click", () => {
    if (busy) return;
    tap();
    site = "cell";
    draw();
    f.slot.setControls(row(cCellBad.el), row(cCellGood.el));
    f.say("혈액이 조직세포 곁에 왔어요. 여기서는 두 기체가 <b>어느 쪽으로</b> 이동할까요?");
  });
  f.slot.setControls(row(cGood.el), row(cBadc.el));
  draw();
  f.say("온몸을 돌고 온 혈액이 허파꽈리 곁에 왔어요. 두 기체가 <b>어느 쪽으로</b> 이동할까요?");
  return lab.cleanup;
};
