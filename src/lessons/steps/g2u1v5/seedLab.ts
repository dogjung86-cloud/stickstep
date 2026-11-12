// [중2 Ⅰ v5] g2u1l7 볍씨 랩: 「소금을 얼마나 넣어야 볍씨가 갈릴까요?」
// 책의 본문과 그림(소금물로 볍씨 고르기)을 손으로 한다: 볍씨를 담근 물에 소금을 녹여 가며 속이 덜 찬 볍씨만 뜨게 만든 뒤 체로 건진다.
// 학생이 정하는 것: 소금의 양(소금물의 밀도), 건지는 때.
// 실패하는 길: 소금이 모자라면 뜬 볍씨가 없어 건질 것이 없고, 넘치면 속이 찬 볍씨까지 떠서 가려낼 수 없다.
// 통찰 하나: 밀도가 다른 두 고체는 밀도가 그 중간인 액체에 넣어 뜨는 것과 가라앉는 것으로 나눈다.
// 수치: 두 볍씨의 밀도(1.06, 1.16 g/mL)는 이 랩에서 정한 어림값이다. 소금물의 밀도는 1.00에서 1.20(진한 소금물)까지 변한다.

import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvBtn, bvRange } from "../bio6/b6Lab";
import { P, fx, g1Lab, g1Log, seeded, svgOpen, type G1Step } from "./g2u1Kit";

const D_LIGHT = 1.06;
const D_FULL = 1.16;
const BK = { x: 26, y: 70, w: 190, h: 130 };
const SURF = BK.y + 22;
const FLOOR = BK.y + BK.h - 10;

export const g2u1SeedLab: StepRenderer = (host, step, api) => {
  const lab = g1Lab(host, api, step as unknown as G1Step, { steps: 2, cls: "g2u1x-sd" });
  const { f, tm } = lab;
  const rnd = seeded(41);
  const seeds = Array.from({ length: 12 }, (_, i) => ({ full: i % 2 === 0, x: BK.x + 18 + i * 13.6 + rnd() * 4, dy: rnd() * 8, rot: Math.round(rnd() * 50 - 25) }));
  f.stage.innerHTML = `${svgOpen}
    <rect class="g2u1x-sd-liq" x="${BK.x + 3}" y="${SURF - 6}" width="${BK.w - 6}" height="${BK.y + BK.h - SURF + 3}" rx="6" fill="${P.water}" opacity=".35"/>
    <g>${seeds.map((s, i) => `<g class="g2u1x-sd-seed" data-i="${i}"><ellipse rx="7.5" ry="4" transform="rotate(${s.rot})" fill="${s.full ? "#D9A441" : "#F3E3B3"}" stroke="${s.full ? "#8A6418" : "#B9A66A"}" stroke-width="1.2"/></g>`).join("")}</g>
    <path d="M${BK.x} ${BK.y} V${BK.y + BK.h - 10} a10 10 0 0 0 10 10 h${BK.w - 20} a10 10 0 0 0 10 -10 V${BK.y} M${BK.x - 6} ${BK.y} h${BK.w + 12}" stroke="${P.glass}" stroke-width="2.4" stroke-linecap="round"/>
    <ellipse cx="240" cy="134" rx="7.5" ry="4" fill="#D9A441" stroke="#8A6418" stroke-width="1.2"/>
    <text x="252" y="138" font-size="12.5" font-weight="700" fill="${P.text}">속이 찬 볍씨</text>
    <text x="252" y="154" font-size="12.5" font-weight="800" fill="${P.yellow}">${fx(D_FULL, 2)}</text>
    <ellipse cx="240" cy="176" rx="7.5" ry="4" fill="#F3E3B3" stroke="#B9A66A" stroke-width="1.2"/>
    <text x="252" y="180" font-size="12.5" font-weight="700" fill="${P.text}">덜 여문 볍씨</text>
    <text x="252" y="196" font-size="12.5" font-weight="800" fill="${P.yellow}">${fx(D_LIGHT, 2)}</text>
  </svg>`;
  const log = g1Log(lab);
  const liq = f.stage.querySelector(".g2u1x-sd-liq") as SVGRectElement;
  const els = Array.from(f.stage.querySelectorAll<SVGGElement>(".g2u1x-sd-seed"));
  let v = 0; // 막대의 값(0~20). 밀도 = 1 + v/100
  let phase: "play" | "end" = "play";
  let failed = "";

  const dens = (): number => 1 + v / 100;
  function paint(): void {
    const d = dens();
    seeds.forEach((s, i) => {
      const up = d > (s.full ? D_FULL : D_LIGHT);
      els[i].style.transform = `translate(${fx(s.x)}px, ${fx(up ? SURF + s.dy * 0.4 : FLOOR - s.dy)}px)`;
    });
    liq.setAttribute("opacity", fx(0.35 + v * 0.012, 2));
    const up = seeds.filter((s) => d > (s.full ? D_FULL : D_LIGHT)).length;
    log.set([`소금물의 밀도 <b class="k">${fx(d, 2)} g/mL</b>`, `뜬 볍씨 <b>${up}개</b> · 가라앉은 볍씨 <b>${12 - up}개</b>`]);
    host.dataset.g2u1Sd = fx(d, 2);
  }
  const range = bvRange({
    cls: "g2u1x-sd-range",
    min: 0,
    max: 20,
    value: 0,
    label: "물에 녹인 소금의 양",
    ticks: ["없음", "많이"],
    onInput: (x) => {
      v = x;
      paint();
    },
    onChange: () => {
      const d = dens();
      if (phase !== "play") return;
      if (d > D_FULL) f.say("소금이 너무 많아요. <b>속이 찬 볍씨까지</b> 모두 떠 버렸어요.");
      else if (d > D_LIGHT) f.say("<b>덜 여문 볍씨만</b> 떠올랐어요. 지금 체로 건져 보세요.");
      else f.say("두 볍씨가 모두 <b>가라앉아</b> 있어요. 소금을 더 녹여 보세요.");
      lab.todo(d > D_LIGHT && d <= D_FULL ? "[data-k='scoop']" : ".g2u1x-sd-range", 11);
    },
  });
  const bScoop = bvBtn("main", "뜬 볍씨를 체로 건지기");
  bScoop.dataset.k = "scoop";
  bScoop.addEventListener("click", () => {
    if (phase !== "play") return;
    const d = dens();
    if (d <= D_LIGHT) {
      haptic(HAPTIC.wrong);
      failed = "none";
      host.dataset.g2u1Fail = failed;
      f.say("뜬 볍씨가 없어 <b>건질 것이 없어요</b>. 물의 밀도가 두 볍씨보다 작아요.");
      return;
    }
    if (d > D_FULL) {
      haptic(HAPTIC.wrong);
      failed = "all";
      host.dataset.g2u1Fail = failed;
      f.say("두 볍씨가 <b>모두 떠서</b> 가려낼 수 없어요. 소금물의 밀도가 두 볍씨보다 커요.");
      return;
    }
    phase = "end";
    haptic(HAPTIC.correct);
    range.input.disabled = true;
    bScoop.disabled = true;
    seeds.forEach((s, i) => {
      if (!s.full) els[i].style.opacity = "0";
    });
    f.pips(1);
    f.say(`밀도 ${fx(d, 2)}인 소금물에서 덜 여문 볍씨만 건졌어요. 바닥에는 <b>속이 찬 볍씨</b>만 남았어요.`);
    tm.later(
      () =>
        lab.judge(
          "두 볍씨를 가르려면 소금물의 밀도는 어때야 할까요?",
          [{ t: "덜 여문 볍씨보다 크고 속이 찬 볍씨보다 작게", ok: true }, { t: "두 볍씨 모두보다 크게" }, { t: "두 볍씨 모두보다 작게" }],
          "1.06과 1.16 <b>사이</b>일 때만 한쪽은 뜨고 한쪽은 가라앉았어요.",
          () => lab.finish("밀도가 다른 두 고체는 밀도가 <b>그 중간인 액체</b>에 넣어, 뜨는 것과 가라앉는 것으로 나눠요. 농가에서 좋은 볍씨를 고르는 방법이에요."),
        ),
      1200,
    );
  });

  paint();
  f.slot.setControls(range.el, bScoop);
  f.say("맹물에 볍씨를 넣으니 모두 가라앉았어요. <b>소금</b>을 녹여 덜 여문 볍씨만 뜨게 해 보세요.");
  api.setCTA("소금을 녹여 볍씨를 갈라 보세요", { enabled: false });
  lab.todo(".g2u1x-sd-range", 11);
  return lab.cleanup;
};
