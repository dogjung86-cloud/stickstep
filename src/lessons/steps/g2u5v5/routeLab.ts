// [중2 Ⅴ v5] g2u5l6 양분의 이동 랩: 「잎의 양분은 어떻게 다른 곳으로 갈까요?」
// 책의 본문과 탐구(광합성산물의 생성, 이동, 저장, 이용을 모형으로 나타내기)를 손으로 한다.
// 학생이 정하는 것: 보낼 형태(녹말 그대로, 설탕으로 바꿔서)와 통로(물관, 체관), 그리고 보낼 곳(새순, 꽃, 뿌리).
// 실패하는 길: 녹말 그대로는 물에 녹지 않아 잎을 떠나지 못한다. 물관은 뿌리에서 올라오는 물의 길이라 양분이 실리지 않는다.
// 성공하면 설탕이 체관을 따라 위(새순, 꽃)로도 아래(뿌리)로도 간다. 도착한 곳마다 쓰임이 보인다.
// 판정: 양분이 이동할 때의 형태와 통로. 결론: 녹말은 설탕으로 바뀌어 체관을 따라 필요한 곳으로 이동한다.

import type { StepRenderer } from "../../types";
import { P, bad, bvBtn, bvTween, chip, g5Lab, g5Svg, good, legend, row, tag, tap, toast, txt, type G5Step } from "./kit";

type Dest = "shoot" | "flower" | "root";
const DEST: Record<Dest, { name: string; path: [number, number][]; say: string; note: string }> = {
  shoot: { name: "새순", path: [[150, 112], [154, 112], [154, 50]], say: "설탕이 <b>위쪽</b> 새순에 닿았어요. 새순이 자라는 데 쓰여요.", note: "자라는 데 씀" },
  flower: { name: "꽃", path: [[150, 112], [154, 112], [154, 84], [226, 66]], say: "설탕이 꽃봉오리에 닿았어요. <b>꽃을 피우는 데</b> 쓰여요.", note: "꽃 피우는 데 씀" },
  root: { name: "뿌리", path: [[150, 112], [154, 112], [154, 196]], say: "설탕이 <b>아래쪽</b> 뿌리에 닿았어요. 녹말로 바뀌어 저장돼요.", note: "녹말로 저장" },
};

export const g2u5RouteLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G5Step;
  const lab = g5Lab(host, api, s, { steps: 3, cls: "g2u5x-route", wait: "양분을 보낼 방법을 정해 보세요" });
  const { f, tm } = lab;
  const stage = g5Svg(lab, "잎, 줄기 속의 물관과 체관, 새순과 꽃과 뿌리가 있는 식물");
  let form: "starch" | "sugar" | null = null;
  let tube: "xylem" | "phloem" | null = null;
  let open = false; // 설탕과 체관으로 길이 열렸다
  let fail: "starch" | "xylem" | "" = "";
  const got = new Set<Dest>();
  let dot: [number, number] | null = null;
  let busy = false;

  const draw = (): void => {
    const sugar = open || fail === "xylem";
    const grains = [[70, 100], [88, 112], [104, 98], [118, 110], [84, 94]]
      .map(([x, y], i) => `<circle${fail === "starch" ? ' class="g2u5x-shake"' : ""} cx="${x}" cy="${y}" r="${sugar ? 4 : 6}" fill="${sugar ? P.sugar : P.starch}" stroke="${sugar ? "#8A5A00" : "#2E2E9A"}" stroke-width="1.2" style="animation-delay:${i * 0.05}s"/>`)
      .join("");
    const k = (d: Dest): number => (got.has(d) ? 1 : 0);
    stage.set(`
      <rect x="0" y="176" width="346" height="54" fill="#3B2A1E"/><line x1="0" y1="176" x2="346" y2="176" stroke="#6B4A32" stroke-width="2"/>
      <rect x="141" y="46" width="18" height="150" rx="4" fill="#2F7D46" stroke="${P.leafDark}" stroke-width="1.4"/>
      <line x1="146" y1="50" x2="146" y2="194" stroke="${P.water}" stroke-width="3" ${fail === "xylem" ? 'stroke-dasharray="5 6" class="g2u5x-dash"' : ""}/>
      <line x1="154" y1="50" x2="154" y2="194" stroke="${P.sugar}" stroke-width="3" ${open ? 'stroke-dasharray="2 5"' : ""}/>
      <path d="M150 84 L226 66" stroke="#2F7D46" stroke-width="6" stroke-linecap="round"/>
      <path d="M142 112 C 120 70, 44 70, 30 104 C 52 138, 122 136, 142 112 Z" fill="${P.leaf}" stroke="${P.leafDark}" stroke-width="2"/>
      ${grains}
      ${txt(82, 150, sugar ? "잎의 설탕" : "잎의 녹말", { size: 12, fill: sugar ? P.sugar : "#A9B0FF" })}
      <g transform="translate(150 46)"><ellipse cx="-${8 + k("shoot") * 4}" cy="-${8 + k("shoot") * 6}" rx="${8 + k("shoot") * 5}" ry="${5 + k("shoot") * 2}" fill="#86D68F" stroke="${P.leafDark}" stroke-width="1.2" transform="rotate(-40)"/><ellipse cx="${8 + k("shoot") * 4}" cy="-${8 + k("shoot") * 6}" rx="${8 + k("shoot") * 5}" ry="${5 + k("shoot") * 2}" fill="#86D68F" stroke="${P.leafDark}" stroke-width="1.2" transform="rotate(40)"/></g>
      ${
        got.has("flower")
          ? [0, 1, 2, 3, 4].map((i) => `<ellipse cx="${232 + Math.cos((i * 2 * Math.PI) / 5 - 1.57) * 11}" cy="${60 + Math.sin((i * 2 * Math.PI) / 5 - 1.57) * 11}" rx="8" ry="8" fill="#FFB3C7" stroke="#C4587A" stroke-width="1.2"/>`).join("") + `<circle cx="232" cy="60" r="6" fill="${P.energy}" stroke="#B8860B"/>`
          : `<ellipse cx="232" cy="60" rx="8" ry="11" fill="#9BCF8A" stroke="${P.leafDark}" stroke-width="1.3"/>`
      }
      <ellipse cx="150" cy="204" rx="${24 + k("root") * 8}" ry="${13 + k("root") * 4}" fill="#B7729A" stroke="#6E3A5A" stroke-width="1.6"/>
      ${txt(196, 40, "새순", { anchor: "start", size: 12, fill: P.dim })}${txt(262, 64, "꽃", { anchor: "start", size: 12, fill: P.dim })}${txt(196, 208, "뿌리", { anchor: "start", size: 12, fill: P.dim })}
      ${(Object.keys(DEST) as Dest[]).filter((d) => got.has(d)).map((d) => tag(d === "shoot" ? 262 : d === "flower" ? 284 : 280, d === "shoot" ? 30 : d === "flower" ? 92 : 216, DEST[d].note, { size: 12, fill: P.leafHi })).join("")}
      ${legend(196, 140, [{ name: "물관", color: P.water }])}${legend(196, 160, [{ name: "체관", color: P.sugar }])}
      ${dot ? `<circle cx="${dot[0].toFixed(1)}" cy="${dot[1].toFixed(1)}" r="6" fill="${P.sugar}" stroke="#8A5A00" stroke-width="1.4"/>` : ""}
      ${fail === "xylem" ? `<circle class="g2u5x-shake" cx="142" cy="112" r="6" fill="${P.sugar}" stroke="#8A5A00" stroke-width="1.4"/>` : ""}
    `);
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
