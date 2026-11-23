// [중2 Ⅵ v5] 호흡 랩 두 판(g2u6l4).
//
// g2u6ChestLab 「풍선은 어떻게 부풀까요?」
//   활동(호흡운동 모형): 투명한 통 하나, 마개를 지나는 Y자관, Y자관 두 갈래 끝의 작은 고무풍선 두 개, 통 아래를 덮은 고무 막,
//   마개와 Y자관 사이의 틈을 막는 고무찰흙. 고무 막을 아래로 당길 때와 위로 밀어 올릴 때 작은 고무풍선의 변화를 본다.
//   통은 움직이지 않는다. 갈비뼈와 가로막이 실제로 어떻게 움직이는지는 무대 오른쪽의 사람 가슴 그림이 고무 막과 함께 보여 준다.
//   학생이 정하는 것: 틈을 고무찰흙으로 막을지, 고무 막을 당길지 밀어 올릴지.
//   실패하는 길: 틈을 막지 않으면 틈으로 공기가 드나들어 풍선이 변하지 않는다.
//
// g2u6GasLab 「산소와 이산화 탄소는 어느 쪽으로 이동할까요?」
//   그림(허파꽈리와 조직세포에서의 기체 교환). 학생이 정하는 것: 허파꽈리와 조직세포에서 두 기체가 이동하는 방향.
//   거꾸로 고르면 건네줄 기체가 없어 교환이 일어나지 않는 것이 보인다.

import type { StepRenderer } from "../../types";
import { gasSvg } from "./gasArt";
import { P, arrow, bad, bvBtn, chip, g6Lab, g6Svg, good, row, tag, tap, toast, txt, type G6Step } from "./kit";

let gasSeq = 0;
// 공기(회청색 한 가지, 산소와 이산화 탄소 색과 다르다)
const AIR = "#A9BCD6";
const AIR_LINE = "#5E7391";
const AIR_GAP = 15;
const airDot = (x: number, y: number, r = 2.7): string => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${AIR}" stroke="${AIR_LINE}" stroke-width=".8"/>`;
/** 고르게 흩어진 점열(할턴 수열) */
const halton = (i: number, b: number): number => {
  let f = 1;
  let r = 0;
  for (let k = i; k > 0; k = Math.floor(k / b)) {
    f /= b;
    r += f * (k % b);
  }
  return r;
};

// ── 호흡운동 모형 ──────────────────────────────────────────────────
// 무대 좌표(346 × 230): 통은 가운데 x 173, 목 34~56(마개), 어깨 56~84, 몸통 112~234, 아래 끝 176(고무 막).
// Y자관은 마개 위 8에서 내려와 92에서 두 갈래(150, 110 / 196, 110)로 나뉘고, 갈래 끝에 풍선이 매달린다.
// 사람 가슴 그림은 오른쪽(가운데 x 276, 가슴 84~180)에 두고 고무 막과 같은 때에 갈비뼈와 가로막을 움직인다.
const NECK = 34; // 마개 위(틈과 고무찰흙의 자리)
const STOP = 56; // 마개 아래
const JUNC = 92; // Y자관이 두 갈래로 나뉘는 곳
const BR = 110; // 두 갈래의 끝
const BOT = 176; // 통 아래 끝(고무 막)
/** 통 속의 반폭: 목(15)에서 어깨를 지나 몸통(61)까지 */
const halfW = (y: number): number => {
  if (y >= 84) return 61;
  const t = Math.max(0, Math.min(1, (y - STOP) / (84 - STOP)));
  return 15 + 46 * (t * t * (3 - 2 * t));
};
export const g2u6ChestLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G6Step;
  const lab = g6Lab(host, api, s, { steps: 3, cls: "g2u6x-chest", wait: "모형을 완성하고 고무 막을 당기거나 밀어 보세요", tall: true });
  const { f } = lab;
  const stage = g6Svg(lab, "투명한 통 속에 작은 고무풍선 두 개가 Y자관에 달려 있고 통 아래에 고무 막을 씌운 호흡운동 모형, 그리고 옆에 갈비뼈와 가로막이 보이는 사람의 가슴 그림");
  let sealed = false;
  let pull = 0; // 고무 막: -1 밀어 올림, 0 그대로, 1 아래로 당김
  let lastMove: "" | "up" | "down" = "";
  let seenIn = false;
  let seenOut = false;

  const vol = (): number => pull; // -1 ~ 1
  // 공기 알갱이(2026-11-15, 그래픽 감사 C086): 통 안팎과 풍선 속에 같은 간격으로 놓고, 통 속 압력이 낮아지면 통 속 알갱이가 성글게,
  // 높아지면 빽빽하게 놓는다(간격이 곧 압력이다). 공기의 화살과 알갱이는 산소, 이산화 탄소 색과 다른 회청색 한 가지다.
  const draw = (): void => {
    const v = sealed ? vol() : 0;
    const r = 15 + v * 5.5;
    const press: "same" | "low" | "high" = !sealed || !lastMove ? "same" : lastMove === "up" ? "low" : "high";
    const balloons = [150, 196].map((x, i) => ({ cx: x + (i ? 1 : -1) * (r * 0.35), cy: BR + 2 + r, rx: r * 0.82, ry: r }));
    let out = "";
    // Y자관(위에서 마개를 지나 내려와 두 갈래)
    out += `<path d="M173 8 L173 ${JUNC} M173 ${JUNC} L150 ${BR} M173 ${JUNC} L196 ${BR}" fill="none" stroke="#9AD1F5" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`;
    // 작은 고무풍선 두 개(속의 공기 알갱이는 바깥과 같은 간격)
    balloons.forEach((b) => {
      out += `<ellipse cx="${b.cx}" cy="${b.cy}" rx="${b.rx}" ry="${b.ry}" fill="#F58CA0" stroke="#B4405A" stroke-width="1.8"/><ellipse cx="${b.cx - r * 0.3}" cy="${BR + 2 + r * 0.7}" rx="${r * 0.18}" ry="${r * 0.3}" fill="#FFD1DA" opacity=".8"/>`;
      for (let y = b.cy - b.ry + 5; y < b.cy + b.ry - 3; y += AIR_GAP)
        for (let x = b.cx - b.rx + 4; x < b.cx + b.rx - 3; x += AIR_GAP) {
          const jx = x + ((Math.round(y) * 7) % 5) - 2;
          if (((jx - b.cx) / (b.rx - 3.5)) ** 2 + ((y - b.cy) / (b.ry - 3.5)) ** 2 < 1) out += airDot(jx, y);
        }
    });
    // 투명한 통(목, 어깨, 몸통). 아래는 열려 있고 고무 막이 덮는다
    out += `<path d="M158 ${STOP} C158 70 112 70 112 92 L112 ${BOT} L234 ${BOT} L234 92 C234 70 188 70 188 ${STOP} Z" fill="rgba(200,225,255,.08)"/>`;
    out += `<path d="M158 ${NECK} L158 ${STOP} C158 70 112 70 112 92 L112 ${BOT} M188 ${NECK} L188 ${STOP} C188 70 234 70 234 92 L234 ${BOT}" fill="none" stroke="${P.glass}" stroke-width="2.2" stroke-linejoin="round"/>`;
    // 마개(고무마개, Y자관이 지나간다)
    out += `<rect x="156" y="${NECK}" width="34" height="${STOP - NECK}" rx="3" fill="#4A5568" stroke="#2D3748" stroke-width="1.4"/>`;
    out += `<rect x="169.5" y="${NECK}" width="7" height="${STOP - NECK}" fill="#9AD1F5"/>`;
    // 통 속 공기 알갱이: 통 안(풍선과 Y자관 밖, 고무 막 위)을 고르게 채운다. 간격은 압력에 따라
    const memY = (x: number): number => {
      const t = Math.max(0, Math.min(1, (x - 112) / 122));
      return BOT + 68 * pull * t * (1 - t);
    };
    const free = (x: number, y: number): boolean => {
      if (y < STOP + 4 || y > memY(x) - 4) return false;
      if (Math.abs(x - 173) > halfW(y) - 4) return false;
      if (balloons.some((b) => ((x - b.cx) / (b.rx + 4)) ** 2 + ((y - b.cy) / (b.ry + 4)) ** 2 < 1)) return false;
      const seg = (ax: number, ay: number, bx: number, by: number): number => {
        const t = Math.max(0, Math.min(1, ((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / ((bx - ax) ** 2 + (by - ay) ** 2)));
        return Math.hypot(x - ax - t * (bx - ax), y - ay - t * (by - ay));
      };
      return seg(173, STOP, 173, JUNC) > 7 && seg(173, JUNC, 150, BR) > 7 && seg(173, JUNC, 196, BR) > 7;
    };
    let area = 0;
    for (let y = STOP; y < BOT + 40; y += 3) for (let x = 108; x < 238; x += 3) if (free(x, y)) area += 9;
    const gap = press === "low" ? AIR_GAP * 1.55 : press === "high" ? AIR_GAP * 0.74 : AIR_GAP;
    const want = Math.round(area / (gap * gap));
    let got = 0;
    for (let i = 1; i < 4000 && got < want; i++) {
      const x = 110 + halton(i, 2) * 126;
      const y = STOP + halton(i, 3) * (BOT + 36 - STOP);
      if (!free(x, y)) continue;
      out += airDot(x, y);
      got += 1;
    }
    // 바깥 공기(통 위, Y자관 둘레): 처음 통 속과 같은 간격
    for (let y = 10; y < NECK - 6; y += AIR_GAP)
      for (let x = 128; x < 222; x += AIR_GAP) if (Math.abs(x - 173) > 8) out += airDot(x + ((Math.round(y) * 5) % 4) - 2, y);
    // 틈과 고무찰흙(마개 위, Y자관 둘레)
    out += sealed ? `<ellipse cx="173" cy="${NECK}" rx="15" ry="6" fill="#F2B84B" stroke="#9A6A1C" stroke-width="1.4"/>` : `<ellipse cx="173" cy="${NECK}" rx="13" ry="4.5" fill="#0B1524" stroke="${P.bad}" stroke-width="1.6" stroke-dasharray="3 3"/>`;
    // 고무 막
    out += `<path d="M112 ${BOT} Q173 ${BOT + pull * 34} 234 ${BOT}" fill="none" stroke="#C084FC" stroke-width="5" stroke-linecap="round"/>`;
    if (pull === 1) out += `<line x1="173" y1="${BOT + 17}" x2="173" y2="${BOT + 34}" stroke="#C084FC" stroke-width="3"/><circle cx="173" cy="${BOT + 38}" r="5" fill="#C084FC"/>`;
    // 공기의 이동: Y자관 속을 지나는 알갱이와 곁의 화살(들어올 때 아래로, 나갈 때 위로)
    if (lastMove && sealed) {
      const cls = lastMove === "up" ? "g2u6x-sink" : "g2u6x-rise";
      out += [0, 1, 2].map((i) => `<circle class="${cls} d${i}" cx="173" cy="${12 + i * 4}" r="3" fill="#fff" stroke="${AIR_LINE}" stroke-width="1"/>`).join("");
      out += lastMove === "up" ? arrow(190, 4, 190, 30, AIR, 3, "g2u6x-pop") : arrow(190, 30, 190, 4, AIR, 3, "g2u6x-pop");
    }
    if (lastMove && !sealed) out += arrow(203, 14, 185, 30, P.bad, 2.6, "g2u6x-blink");
    // 사람의 가슴(오른쪽): 고무 막을 당기면 들숨처럼 갈비뼈가 올라가고 가로막이 내려가며, 밀어 올리면 날숨처럼 반대로 움직인다
    out += txt(276, 72, "사람의 가슴", { size: 12, fill: P.dim });
    out += `<path d="M256 86 Q276 78 296 86 L300 178 Q276 186 252 178 Z" fill="rgba(255,255,255,.05)" stroke="#8FA3BF" stroke-width="1.6"/>`;
    [266, 286].forEach((x) => (out += `<ellipse cx="${x}" cy="${130 + pull * 2}" rx="${8 + pull * 1.6}" ry="${28 + pull * 4}" fill="#F58CA0" stroke="#B4405A" stroke-width="1.4" opacity=".9"/>`));
    [0, 1, 2].forEach((k) => {
      const y = 100 + k * 22 - pull * 5;
      out += `<path d="M254 ${y + pull * 2} Q276 ${y + 9 - pull * 3} 298 ${y + pull * 2}" fill="none" stroke="#E9EEF7" stroke-width="2.6" stroke-linecap="round" opacity=".75"/>`;
    });
    out += `<path d="M252 176 Q276 ${158 + pull * 16} 300 176" fill="none" stroke="#C084FC" stroke-width="4" stroke-linecap="round"/>`;
    out += txt(344, 108, "갈비뼈", { anchor: "end", size: 12, fill: "#E9EEF7" }) + txt(344, 172, "가로막", { anchor: "end", size: 12, fill: "#D9B8FF" });
    if (pull) out += txt(276, 202, pull === 1 ? "들숨" : "날숨", { size: 12.5, fill: P.hi, weight: 800 });
    // 이름표와 읽을 값
    out += tag(54, 22, "Y자관", { size: 12 }) + tag(54, 92, "투명한 통", { size: 12 }) + tag(54, 140, "작은 고무풍선", { size: 12 }) + tag(54, 190, "고무 막", { size: 12 });
    const vt = vol() > 0 ? "커짐" : vol() < 0 ? "작아짐" : "처음과 같음";
    const pt = press === "low" ? "낮아짐" : press === "high" ? "높아짐" : "바깥과 같음";
    out += txt(338, 30, `통 속 부피: ${vt}`, { anchor: "end", size: 12.5, fill: P.hi }) + txt(338, 49, `통 속 압력: ${pt}`, { anchor: "end", size: 12.5, fill: press === "same" ? P.dim : "#FFFFFF", weight: press === "same" ? 700 : 800 });
    out += airDot(262, 221, 3.4) + txt(270, 225.5, "공기 알갱이", { anchor: "start", size: 12, fill: P.text });
    stage.set(out);
    host.dataset.g6Vol = String(vol());
    host.dataset.g6Sealed = sealed ? "1" : "0";
  };
  const go = bvBtn("main g2u6x-go", "풍선이 부푸는 원리 정리하기");
  go.disabled = true;
  const moved = (before: number): void => {
    const now = vol();
    if (now === before) return;
    lastMove = now > before ? "up" : "down";
    draw();
    if (!sealed) {
      bad();
      host.dataset.g6Fail = "leak";
      toast(lab, "공기가 새어 풍선 크기가 변하지 않아요", true, true);
      // 막을 당기면 틈으로 공기가 들어오고 밀면 나간다. 그래서 "새어 나갔기"가 아니라 "드나들었기"로 쓴다.
      f.say("Y자관 주변의 틈으로 공기가 드나들었기 때문에 통 속 압력이 변하지 않았어요. 먼저 <b>Y자관 주변 틈 막기</b>를 눌러 고무찰흙으로 밀봉해 보세요.");
      return;
    }
    host.dataset.g6Fail = "";
    good();
    if (lastMove === "up") {
      seenIn = true;
      f.say(`통 속 부피가 <b>커지고</b> 압력이 바깥보다 <b>낮아져서</b>, Y자관을 통해 공기가 들어와 풍선이 <b>부풀어 올랐어요</b>!${seenOut ? "" : " 이어서 <b>고무 막 밀어 올리기</b>도 해 보세요."}`);
    } else {
      seenOut = true;
      f.say(`통 속 부피가 <b>작아지고</b> 압력이 바깥보다 <b>높아져서</b>, 공기가 밖으로 빠져나가 풍선이 <b>오므라들었어요</b>!${seenIn ? "" : " 이어서 <b>고무 막 당기기</b>도 해 보세요."}`);
    }
    f.pips((seenIn ? 1 : 0) + (seenOut ? 1 : 0));
    go.disabled = !(seenIn && seenOut);
  };

  const cSeal = chip("seal", "Y자관 주변 틈 막기", "열려 있음", () => {
    tap();
    lab.f.stage.querySelector(".g2u6x-toast")?.remove();
    sealed = !sealed;
    cSeal.sub(sealed ? "고무찰흙으로 밀봉" : "열려 있음");
    cSeal.on(sealed);
    lastMove = "";
    pull = 0;
    cPull.on(false);
    cPush.on(false);
    draw();
    f.say(sealed ? "고무찰흙으로 Y자관 주변의 틈을 빈틈없이 막았어요! 이제 <b>고무 막 당기기</b>를 눌러 보세요." : "고무찰흙을 떼어 내어 Y자관 주변의 틈이 열렸어요.");
  });
  const setPull = (v: number): void => {
    tap();
    const b = vol();
    pull = pull === v ? 0 : v;
    cPull.on(pull === 1);
    cPush.on(pull === -1);
    moved(b);
  };
  const cPull = chip("pull", "고무 막 당기기", "아래로 잡아당기기", () => setPull(1));
  const cPush = chip("push", "고무 막 밀어 올리기", "위로 밀어 올리기", () => setPull(-1));
  go.addEventListener("click", () => {
    tap();
    // 판정의 근거가 무대에 남도록 고무 막을 당긴 모습으로 되돌린다.
    pull = 1;
    lastMove = "up";
    draw();
    f.say("고무 막을 아래로 당긴 모습이에요. 풍선이 <b>부풀어</b> 있어요.");
    lab.judge("고무 막을 아래로 당겼을 때 통 속의 고무풍선이 <b>부풀어 오른</b> 까닭은 무엇인가요?", [{ t: "통 속 부피가 커지면서 압력이 낮아져서", ok: true }, { t: "고무 막이 바깥 공기를 직접 밀어 넣어서" }, { t: "고무풍선에 근육이 있어 스스로 늘어나서" }], "고무 막을 당기면 통 속 부피가 커지면서 <b>압력이 바깥보다 낮아지고</b>, 그 결과 바깥 공기가 Y자관을 통해 풍선 속으로 들어와요.", () =>
      lab.finish("통 속 <b>부피가 커지면</b> 압력이 낮아져 공기가 풍선으로 들어오고, <b>부피가 작아지면</b> 압력이 높아져 공기가 나가요. 풍선은 스스로 움직이지 않았어요."),
    );
  });
  f.slot.setControls(row(cSeal.el), row(cPull.el, cPush.el), go);
  draw();
  f.say("풍선에는 손을 대지 않아요. 통 아래의 <b>고무 막</b>을 움직여 풍선을 부풀려 봐요.");
  return lab.cleanup;
};

// ── 기체 교환 ──────────────────────────────────────────────────────
export const g2u6GasLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G6Step;
  const lab = g6Lab(host, api, s, { steps: 3, cls: "g2u6x-gas", wait: "허파꽈리와 조직세포에서 기체가 이동하는 방향을 골라 보세요", tall: true });
  const { f, tm } = lab;
  const stage = g6Svg(lab, "두 칸으로 나눈 무대. 왼쪽은 모세혈관이 감싼 허파꽈리, 오른쪽은 조직세포 곁을 지나는 모세혈관이고, 두 칸 사이는 심장을 거쳐 가는 길로 이어진다");
  const ns = `g6g${++gasSeq}`;
  let site: "lung" | "cell" = "lung";
  let blood: "co2" | "o2" = "co2"; // 혈액이 많이 가진 기체
  let lungDone = false;
  let cellDone = false;
  let missAt: "" | "lung" | "cell" = "";
  let final = false;
  let busy = false;

  // 그림은 gasArt.ts(두 칸 무대: 허파꽈리와 조직세포, 사이는 "심장을 거쳐" 길). 산소는 적혈구에, 이산화 탄소는 혈장에 그린다.
  const draw = (): void => {
    stage.set(gasSvg({ site, lungDone, cellDone, miss: missAt, final, ns }));
    host.dataset.g6Site = site;
    host.dataset.g6Blood = blood;
  };

  const move = bvBtn("main g2u6x-move", "산소를 실은 혈액을 조직세포로 보내기");
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
      toast(lab, "농도가 낮은 곳에서 높은 곳으로는 이동하지 않아요", true, true);
      // 조직세포 쪽: 수정안의 "호흡을 한 조직세포"는 세포호흡(레슨 6)을 아직 배우지 않은 때라 옛 글의 "산소를 써 버린"으로 썼다
      f.say(here === "lung" ? "기체는 농도가 <b>높은(많은) 곳에서 낮은(적은) 곳</b>으로 이동해요. 숨을 들이쉰 허파꽈리에는 <b>산소</b>가 더 많고, 온몸을 돌고 온 혈액에는 <b>이산화 탄소</b>가 더 많아요." : "허파를 지나온 혈액에는 <b>산소</b>가 많고, 산소를 써 버린 조직세포에는 <b>이산화 탄소</b>가 많이 쌓여 있어요. 많은 곳에서 적은 곳으로 가는 방향을 골라 보세요.");
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
      f.say("허파꽈리에 많던 <b>산소</b>가 모세혈관의 혈액으로 들어오고, 혈액에 많던 <b>이산화 탄소</b>는 허파꽈리로 빠져나갔어요! 이제 산소를 실은 혈액을 조직세포로 보내 볼까요?");
      f.slot.setControls(move);
    } else {
      cellDone = true;
      blood = "co2";
      f.pips(2);
      draw();
      f.say("혈액 속의 <b>산소</b>가 조직세포로 전달되고, 조직세포에서 생긴 <b>이산화 탄소</b>가 혈액으로 넘어왔어요!");
      busy = true;
      tm.later(() => {
        // 판정의 근거: 두 칸을 다 밝힌다(허파꽈리 쪽 관은 산소가 적은 색에서 많은 색으로 바뀌어 있다)
        final = true;
        draw();
        // 결론의 "(분압)"은 뺐다(중학교에서 배우지 않는 말). 확산은 중1에서 배운 말이다.
        lab.judge("혈액이 <b>허파꽈리</b>를 감싼 모세혈관을 지나는 동안 혈액 속에서 농도가 높아진(늘어난) 기체는 무엇인가요?", [{ t: "산소", ok: true }, { t: "이산화 탄소" }, { t: "산소와 이산화 탄소 모두" }], "허파꽈리에서 모세혈관의 혈액으로 <b>산소</b>가 들어오고, 혈액 속의 이산화 탄소는 허파꽈리로 빠져나가요.", () =>
          lab.finish("기체는 농도 차이에 따라 높은 곳에서 낮은 곳으로 퍼지는 <b>확산</b>에 의해 이동해요. 따라서 <b>허파꽈리</b>에서는 산소가 혈액으로 들어오고 이산화 탄소가 나가며, <b>조직세포</b>에서는 산소가 세포로 전달되고 이산화 탄소가 혈액으로 나와요."),
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
    f.say("산소를 가득 실은 혈액이 심장을 거쳐 온몸의 <b>조직세포</b>에 도착했어요. 여기서는 두 기체가 어느 쪽으로 이동할까요?");
  });
  f.slot.setControls(row(cGood.el), row(cBadc.el));
  draw();
  // 수정안의 "농도(분압)"에서 '분압'은 중학교에서 배우지 않는 말이라 뺐다. 확산은 중1에서 배운 말이고, 무대에 두 기체의 알갱이가 그려져 있다.
  f.say("기체는 농도가 <b>높은 곳에서 낮은 곳</b>으로 스스로 퍼져 나가요(확산). 알갱이 개수를 비교해 보고, <b>허파꽈리</b>에서 산소와 이산화 탄소가 이동할 방향을 골라 보세요.");
  return lab.cleanup;
};
