// u7SunLab: 태양의 표면과 대기, 활동(u7l3). 태양의 표면과 대기, 흑점 수와 태양의 활동, 태양 활동이 지구에 미치는 영향을 다룬다.
// 틀과 흐름(한 화면, 조작 칸 하나, 할 일 셋, 판정, 결론, 궁금증 카드)은 v5 그대로다.
// 할 일은 셋이다(흑점 누르기, 달이 가렸을 때 보기, 가려진 채로 흑점 수 늘리기). 앞의 둘은 차례가 없고 도움말이 남은 일을 알려 준다.
//
// 무대 그림(2026-11-15 그래픽 손질, 감사 u7l3 다섯 줄):
//   · 평소의 태양은 실사다(photos/sun_whitelight.jpg, NOIRLab 백색광 1989. 다음 스텝 핫스팟의 '평소' 사진과 같은 태양).
//     흑점은 사진 속 흑점 그대로이고, 흑점 수 막대가 낮으면 일부 흑점을 그 둘레 광구 색으로 덮어 '적을 때'를 만든다.
//     흑점은 사진대로 적도 양쪽 띠에 무리 지어 있다(예전 손그림은 고르게 흩어졌다). 사진 속 자리는 아래 SPOTS.
//   · 평소에는 홍염을 그리지 않는다(대기는 광구 빛에 묻혀 안 보인다, 정리 카드 2와 같은 말). 홍염과 채층은 달이 가렸을 때만.
//   · 달이 가렸을 때의 코로나는 실제 개기일식 사진(photos/eclipse_corona.jpg, NASA 2017)의 코로나를 더하기로 얹는다.
//     흑점이 적으면 코로나를 태양 반지름의 약 1.3배에서 끊고, 많으면 약 2.5배까지 밝게 보인다. 홍염(분홍)은 코드로 얹는다.
//   · 가렸을 때도 원인이 보이게 오른쪽 위 작은 창에 '가려진 광구'(지금의 흑점)를 둔다.
//   · 판정과 결론 때는 무대를 두 칸 비교판으로 바꾼다: 흑점이 적을 때와 많을 때, 위는 평소, 아래는 가렸을 때.

import { el, clamp } from "../../../core/dom";
import { createLoop, type Loop } from "../../../core/anim";
import { fitStageCanvas } from "../../../ui/canvas";
import { localPt } from "../../../core/wide";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import type { StepRenderer } from "../../types";
import { bvRange } from "../bio6/b6Lab";
import { u7Frame, u7Dev } from "./kit";

interface SunStep {
  title: string;
  cta?: string;
  curio?: Curio;
}

const H = 230;
const CY = 116;
const R = 74;

// 백색광 사진의 원판(사진 px): 가운데와 반지름(어두워지는 가장자리 끝까지)
const SUN = { file: "sun_whitelight.jpg", cx: 905, cy: 855, r: 760 };
// 사진 속 흑점: [x, y, 덮는 반지름(사진 px), 흑점 수에 드는가, 나타나는 흑점 수 막대 값(0~1)]
// 가운데 둘은 늘 보인다. 나머지는 막대를 올릴수록 하나씩 드러난다(낮으면 둘레 광구 색으로 덮는다).
const SPOTS: [number, number, number, 0 | 1, number][] = [
  [875.4, 769.9, 34, 1, 0],
  [966.6, 799.8, 26, 1, 0],
  [1279.3, 735.3, 18, 1, 0.15],
  [337.3, 1093.9, 30, 1, 0.3],
  [403.5, 1097.5, 28, 1, 0.42],
  [640.6, 728.9, 16, 1, 0.55],
  [928, 780, 18, 1, 0.68],
  [1552.5, 707, 16, 1, 0.78],
  [605.8, 721.4, 9, 1, 0.88],
  [237.5, 1142.9, 14, 1, 0.88],
  [578.5, 598.5, 7, 0, 0.95],
  [578.8, 624.6, 7, 0, 0.95],
  [1086.3, 264.9, 7, 0, 0.95],
  [535, 872, 6, 0, 0.95],
  [830.4, 880.2, 6, 0, 0.95],
];
// 개기일식 사진의 달(사진 px)
const ECL = { file: "eclipse_corona.jpg", cx: 958, cy: 597, r: 255.3 };
// 홍염 자리(캔버스 각, 0이 오른쪽이고 시계 방향). 앞의 것부터 나타난다(흑점이 많을수록 잦다).
const PROM_A = [0.9, 2.55, 4.05, 5.3, 1.75, 3.35];

const EARTH: { key: string; name: string; at: number; icon: string }[] = [
  {
    key: "aurora", name: "넓은 오로라", at: 0.5,
    icon: `<path class="u7x-au" d="M2.5 13.2c.4-3.6 1.2-7 2.4-10.2M7.1 13.2c.4-3.6 1.1-7 2.2-10.2M11.6 13.2c.3-3.4 1-6.6 2-9.6" stroke-width="2"/><path d="M1.3 14.4h13.4" stroke-width="1.3"/>`,
  },
  {
    key: "radio", name: "통신 장애", at: 0.68,
    icon: `<path d="M8 7.2v7.3M5.6 14.5h4.8M8 7.2 5.9 12.6M8 7.2l2.1 5.4" stroke-width="1.4"/><path d="M5.1 5.1a4.1 4.1 0 0 1 5.8 0M3.2 3.2a6.8 6.8 0 0 1 9.6 0" stroke-width="1.4"/><path d="M12.4 9.2l2.6 2.6M15 9.2l-2.6 2.6" class="u7x-x" stroke-width="1.5"/>`,
  },
  {
    key: "power", name: "대규모 정전", at: 0.85,
    icon: `<path d="M8 1.6 4.4 14.6M8 1.6l3.6 13M4.9 5.2h6.2M3.6 8.4h8.8M5.2 8.4l5.4 4.4M10.8 8.4l-5.4 4.4M3.4 14.6h9.2" stroke-width="1.3"/>`,
  },
];

/** 흑점 수 막대 값 a에서 보이는 흑점(SPOTS 번호). */
const shownAt = (a: number): number[] => SPOTS.map((_, i) => i).filter((i) => SPOTS[i][4] <= a + 1e-6);
const countAt = (a: number): number => shownAt(a).filter((i) => SPOTS[i][3]).length;

export const u7SunLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as SunStep;
  const f = u7Frame(host, { title: s.title, steps: 4, cls: "u7x-sun", api, tall: true }); // 할 일을 이어 붙인 도움말이 세 줄이 된다
  const doneCta = s.cta ?? "개념 정리하기";
  const photoUrl = (file: string): string => `${import.meta.env.BASE_URL}photos/${file}`;

  const canvas = el("canvas", { class: "u7x-cv" }) as HTMLCanvasElement;
  const pill = el("div", { class: "bv-pill u7x-pill", text: "흑점 3개" });
  f.stage.append(canvas, pill);

  let mode: "surf" | "ecl" = "surf";
  let activity = 0.2;
  let coverT = 0;
  let coronaMs = 0;
  let activeMs = 0;
  let tapped = -1;
  let board = false; // 판정과 결론: 두 칸 비교판
  const did = { spot: false, corona: false, active: false };
  let phase: "play" | "wait" | "ask" | "done" = "play";
  let disposed = false;
  host.dataset.u7Phase = phase;

  // 조작부
  const surfBtn = el("button", { class: "u7x-segbtn on", attrs: { type: "button", "aria-pressed": "true" }, dataset: { v: "surf" } }, el("span", { text: "평소의 태양" })) as HTMLButtonElement;
  const eclBtn = el("button", { class: "u7x-segbtn", attrs: { type: "button", "aria-pressed": "false" }, dataset: { v: "ecl" } }, el("span", { text: "달이 가렸을 때(개기일식)" })) as HTMLButtonElement;
  const seg = el("div", { class: "u7x-seg two" }, surfBtn, eclBtn);
  const range = bvRange({
    cls: "u7x-range",
    min: 0,
    max: 100,
    value: 20,
    label: "흑점 수를 조절해 보세요",
    ticks: ["흑점이 적을 때", "흑점이 많을 때"],
    onInput: (v) => {
      activity = v / 100;
    },
  });
  // 지구에 생기는 일: 칩마다 작은 그림(오로라 띠, 안테나, 송전탑)이 글과 함께 켜진다
  const lamps = EARTH.map((e) =>
    el(
      "span",
      { class: "u7x-lamp", dataset: { k: e.key } },
      el("i", { class: "u7x-lampic", html: `<svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${e.icon}</svg>` }),
      el("b", { text: e.name }),
    ),
  );
  const earthRow = el("div", { class: "u7x-lamps" }, el("i", { text: "지구에 나타나는 일" }), ...lamps);
  f.slot.setControls(seg, range.el, earthRow);
  f.say("태양의 밝은 표면인 <b>광구</b>예요. 표면에 보이는 <b>어두운 점</b>을 눌러 보세요.");
  f.pips(1);
  api.setCTA("태양의 표면과 대기를 모두 살펴보세요", { enabled: false });

  function setMode(m: "surf" | "ecl"): void {
    if (mode === m) return;
    mode = m;
    surfBtn.classList.toggle("on", m === "surf");
    eclBtn.classList.toggle("on", m === "ecl");
    surfBtn.setAttribute("aria-pressed", String(m === "surf"));
    eclBtn.setAttribute("aria-pressed", String(m === "ecl"));
    haptic(HAPTIC.select);
    host.dataset.u7Mode = m;
  }
  surfBtn.addEventListener("click", () => setMode("surf"));
  eclBtn.addEventListener("click", () => setMode("ecl"));

  function next(): void {
    const n = Number(did.spot) + Number(did.corona) + Number(did.active);
    host.dataset.u7Done = String(n);
    f.pips(1 + Math.min(n, 2));
    if (n === 3 && phase === "play") {
      phase = "wait";
      window.setTimeout(() => !disposed && ask(), 1600);
    }
  }
  // 둘째 할 일은 버튼 이름(eclBtn) 그대로 부른다
  const todo = (): string =>
    !did.spot ? " <b>평소의 태양</b> 탭에서 표면의 어두운 점을 눌러 보세요." : !did.corona ? " 이제 <b>달이 가렸을 때(개기일식)</b>를 눌러 태양의 대기를 살펴보세요." : !did.active ? " 달이 가린 상태에서 <b>흑점 수 막대</b>를 오른쪽 끝까지 밀어 보세요." : "";

  function ask(): void {
    phase = "ask";
    host.dataset.u7Phase = phase;
    board = true; // 원인(흑점)과 결과(코로나, 홍염)를 적을 때와 많을 때로 나란히
    pill.style.display = "none";
    f.pips(3);
    f.say("흑점이 적을 때와 많을 때의 모습을 비교하며 질문에 답해 보세요.");
    f.slot.ask(
      "흑점이 <b>많을 때</b> 태양의 대기에서는 어떤 변화가 나타났나요?",
      [{ t: "홍염이 자주 나타나고 코로나가 커져요", ok: true }, { t: "홍염이 줄어들고 코로나가 작아져요" }, { t: "흑점 수와 상관없이 늘 같은 모습이에요" }],
      (ok) => api.recordQuiz(ok),
      { why: "흑점 수가 많을수록 태양 활동이 활발해져 코로나가 커지고 홍염과 플레어가 자주 나타나요.", onNext: conclude },
    );
  }
  function conclude(): void {
    phase = "done";
    host.dataset.u7Phase = phase;
    f.pips(4);
    f.say("흑점 수는 약 <b>11년</b>을 주기로 많아졌다 적어지기를 반복해요.");
    f.slot.conclude("흑점이 <b>많을수록</b> 태양 활동이 활발해져 코로나가 커지고 홍염과 플레어가 자주 나타나요. 이때 지구에서는 <b>오로라</b>가 넓게 나타나고 무선 통신 장애나 정전이 일어나기도 해요.");
    if (s.curio) host.appendChild(curioCard(s.curio));
    api.enableCTA(doneCta);
  }

  // ── 사진 준비(한 번) ──────────────────────────────────────────
  const D = 640; // 원판 그림판 크기(무대 반지름 74 × 넓은 화면 배율 4 × 2 = 592보다 크게)
  const fp = D / (SUN.r * 2); // 사진 px → 그림판 px
  const toDisk = (x: number, y: number): [number, number] => [(x - (SUN.cx - SUN.r)) * fp, (y - (SUN.cy - SUN.r)) * fp];
  let diskFull: HTMLCanvasElement | null = null; // 사진 그대로(원으로 자름)
  let diskClean: HTMLCanvasElement | null = null; // 늘 보이는 두 흑점 말고는 둘레 광구 색으로 덮은 판
  const diskCache = new Map<number, HTMLCanvasElement>();
  let coronaLow: HTMLCanvasElement | null = null; // 코로나(흑점이 적을 때: 1.3배에서 끊김)
  let coronaHigh: HTMLCanvasElement | null = null; // 코로나(흑점이 많을 때: 2.5배까지)
  const CK = 2.6; // 코로나 그림판이 담는 범위(달 반지름의 배수)

  const mk = (w: number, h = w): HTMLCanvasElement => {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    return c;
  };
  const loadImg = (file: string, onLoad: (im: HTMLImageElement) => void): void => {
    const im = new Image();
    im.decoding = "async";
    im.onload = () => !disposed && onLoad(im);
    im.src = photoUrl(file);
  };
  loadImg(SUN.file, (im) => {
    const full = mk(D);
    const g = full.getContext("2d")!;
    g.beginPath();
    g.arc(D / 2, D / 2, D / 2, 0, Math.PI * 2);
    g.clip();
    g.drawImage(im, SUN.cx - SUN.r, SUN.cy - SUN.r, SUN.r * 2, SUN.r * 2, 0, 0, D, D);
    const clean = mk(D);
    const c = clean.getContext("2d")!;
    c.drawImage(full, 0, 0);
    const data = g.getImageData(0, 0, D, D).data;
    // 덮을 흑점마다 둘레 고리의 평균 색으로 메운다(가장자리는 흐리게)
    for (const [x, y, rr, , at] of SPOTS) {
      if (at <= 0) continue;
      const [px, py] = toDisk(x, y);
      const pr = rr * fp;
      let sr = 0;
      let sg = 0;
      let sb = 0;
      let n = 0;
      const r0 = pr * 1.25;
      const r1 = pr * 1.75 + 1;
      for (let yy = Math.floor(py - r1); yy <= py + r1; yy++) {
        for (let xx = Math.floor(px - r1); xx <= px + r1; xx++) {
          const d = Math.hypot(xx - px, yy - py);
          if (d < r0 || d > r1 || xx < 0 || yy < 0 || xx >= D || yy >= D) continue;
          const k = (yy * D + xx) * 4;
          if (data[k + 3] < 250) continue;
          sr += data[k];
          sg += data[k + 1];
          sb += data[k + 2];
          n++;
        }
      }
      if (!n) continue;
      const col = `${Math.round(sr / n)},${Math.round(sg / n)},${Math.round(sb / n)}`;
      const gr = c.createRadialGradient(px, py, 0, px, py, pr * 1.3);
      gr.addColorStop(0, `rgba(${col},1)`);
      gr.addColorStop(0.72, `rgba(${col},1)`);
      gr.addColorStop(1, `rgba(${col},0)`);
      c.fillStyle = gr;
      c.beginPath();
      c.arc(px, py, pr * 1.3, 0, Math.PI * 2);
      c.fill();
    }
    diskFull = full;
    diskClean = clean;
    diskCache.clear();
  });
  loadImg(ECL.file, (im) => {
    // lift < 1이면 희미한 바깥 코로나를 조금 끌어올린다(흑점이 많을 때 코로나가 '커진 것'이 작은 비교판에서도 보이게)
    const make = (fadeFrom: number, fadeTo: number, gain: number, lift = 1): HTMLCanvasElement => {
      const S = 1024;
      const cv = mk(S);
      const g = cv.getContext("2d")!;
      const half = ECL.r * CK;
      g.drawImage(im, ECL.cx - half, ECL.cy - half, half * 2, half * 2, 0, 0, S, S);
      // 빛만 남긴다: 밝기를 불투명도로(사진의 검은 하늘이 무대 바탕을 덮어 코로나 둘레가 검게 비지 않게)
      const id = g.getImageData(0, 0, S, S);
      const px = id.data;
      for (let k = 0; k < px.length; k += 4) {
        const m = Math.max(px[k], px[k + 1], px[k + 2]);
        if (m < 3) {
          px[k + 3] = 0;
          continue;
        }
        const sc = 255 / m;
        px[k] = Math.min(255, px[k] * sc);
        px[k + 1] = Math.min(255, px[k + 1] * sc);
        px[k + 2] = Math.min(255, px[k + 2] * sc);
        px[k + 3] = Math.round(px[k + 3] * Math.pow(m / 255, lift) * gain);
      }
      g.putImageData(id, 0, 0);
      g.globalCompositeOperation = "destination-in";
      const rr = S / 2 / CK; // 그림판 위 달 반지름
      const gr = g.createRadialGradient(S / 2, S / 2, rr * fadeFrom, S / 2, S / 2, rr * fadeTo);
      gr.addColorStop(0, "rgba(0,0,0,1)");
      gr.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = gr;
      g.fillRect(0, 0, S, S);
      return cv;
    };
    coronaLow = make(1.04, 1.32, 0.85);
    coronaHigh = make(1.25, 2.5, 1.2, 0.62);
  });

  /** 흑점 수 막대 값 a의 원판(보이는 흑점만 사진에서 되살린다). */
  function diskAt(a: number): HTMLCanvasElement | null {
    if (!diskFull || !diskClean) return null;
    const shown = shownAt(a);
    const key = shown.length;
    const hit = diskCache.get(key);
    if (hit) return hit;
    const cv = mk(D);
    const g = cv.getContext("2d")!;
    g.drawImage(diskClean, 0, 0);
    for (const i of shown) {
      const [x, y, rr, , at] = SPOTS[i];
      if (at <= 0) continue;
      const [px, py] = toDisk(x, y);
      g.save();
      g.beginPath();
      g.arc(px, py, rr * fp * 1.3, 0, Math.PI * 2);
      g.clip();
      g.drawImage(diskFull, 0, 0);
      g.restore();
    }
    diskCache.set(key, cv);
    return cv;
  }

  /** 무대 위 흑점 자리(설계 px). */
  const spotXY = (i: number, cx: number, cy: number, r: number): [number, number, number] => {
    const k = r / SUN.r;
    return [cx + (SPOTS[i][0] - SUN.cx) * k, cy + (SPOTS[i][1] - SUN.cy) * k, SPOTS[i][2] * k];
  };

  /** 평소의 태양(사진). small이면 흑점을 조금 키워 찍는다(작은 창과 비교판에서 흑점이 1px 밑으로 사라지지 않게). */
  function drawSun(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, a: number, small = false): void {
    const disk = diskAt(a);
    if (disk) ctx.drawImage(disk, cx - r, cy - r, r * 2, r * 2);
    else {
      // 사진이 오기 전 잠깐(같은 색의 민무늬 원판)
      const g = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r);
      g.addColorStop(0, "#F7A21C");
      g.addColorStop(0.85, "#D9720C");
      g.addColorStop(1, "#7A2E04");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }
    if (small) {
      ctx.fillStyle = "rgba(48,20,4,.9)";
      for (const i of shownAt(a)) {
        if (!SPOTS[i][3]) continue;
        const [x, y, rr] = spotXY(i, cx, cy, r);
        ctx.beginPath();
        ctx.arc(x, y, clamp(rr * 0.75, 1.15, 2.2), 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  /** 코로나(사진, 더하기로 얹는다). a: 흑점 수 막대 값, alpha: 드러난 정도. */
  function drawCorona(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, a: number, alpha: number): void {
    if (!coronaLow || !coronaHigh || alpha <= 0) return;
    const half = r * CK;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = alpha * (1 - a);
    ctx.drawImage(coronaLow, cx - half, cy - half, half * 2, half * 2);
    ctx.globalAlpha = alpha * a;
    ctx.drawImage(coronaHigh, cx - half, cy - half, half * 2, half * 2);
    ctx.restore();
  }

  /** 홍염(분홍 불꽃 고리, 가장자리에서 솟는다). 흑점이 많을수록 잦고 크다. 돌려주는 값: 첫 홍염 끝(이름표 자리). */
  function drawProms(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, a: number, alpha: number, tMs: number, big = 1): [number, number] | null {
    if (alpha <= 0) return null;
    const n = Math.round(1 + a * 5);
    let first: [number, number] | null = null;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";
    for (let i = 0; i < n; i++) {
      const ang = PROM_A[i] + Math.sin(tMs * 0.0003 + i * 1.7) * 0.012;
      const h = r * (0.07 + 0.05 * a + (i % 3) * 0.022) * (1 + Math.sin(tMs * 0.0011 + i) * 0.06) * big;
      const w = r * (0.11 + (i % 2) * 0.05) * big;
      const ux = Math.cos(ang);
      const uy = Math.sin(ang);
      const nx = -uy;
      const ny = ux;
      const bx = cx + ux * r * 0.995;
      const by = cy + uy * r * 0.995;
      // 고리 셋(바깥이 크고 옅다): 발 둘이 가장자리에 붙은 아치
      for (let k = 0; k < 3; k++) {
        const hh = h * (1 - k * 0.24);
        const ww = w * (1 - k * 0.2);
        const sk = (k - 1) * 0.18 * w; // 고리마다 조금 비껴 덩어리처럼
        ctx.strokeStyle = `rgba(255,${84 + k * 22},${118 + k * 10},${(0.62 - k * 0.12) * alpha})`;
        ctx.lineWidth = Math.max(1.2, r * 0.026 * big) * (1 - k * 0.2);
        ctx.shadowColor = "rgba(255,70,110,.9)";
        ctx.shadowBlur = r * 0.06;
        ctx.beginPath();
        ctx.moveTo(bx - nx * ww * 0.5 + nx * sk, by - ny * ww * 0.5 + ny * sk);
        ctx.bezierCurveTo(
          bx - nx * ww * 0.6 + ux * hh * 1.25 + nx * sk, by - ny * ww * 0.6 + uy * hh * 1.25 + ny * sk,
          bx + nx * ww * 0.6 + ux * hh * 1.25 + nx * sk, by + ny * ww * 0.6 + uy * hh * 1.25 + ny * sk,
          bx + nx * ww * 0.5 + nx * sk, by + ny * ww * 0.5 + ny * sk,
        );
        ctx.stroke();
      }
      if (i === 0) first = [bx + ux * (h + 10), by + uy * (h + 10)];
    }
    ctx.restore();
    return first;
  }

  /** 채층(분홍 얇은 테). */
  function drawChromo(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, alpha: number): void {
    if (alpha <= 0) return;
    ctx.save();
    ctx.strokeStyle = `rgba(255,78,112,${0.9 * alpha})`;
    ctx.lineWidth = Math.max(1.6, r * 0.03);
    ctx.shadowColor = "rgba(255,60,100,.8)";
    ctx.shadowBlur = r * 0.05;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.022, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  const moonDisk = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void => {
    ctx.fillStyle = "#05080F";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  };

  const label = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, align: CanvasTextAlign = "center", color = "#FFEFC8", size = 13): void => {
    ctx.font = `800 ${size}px Pretendard, sans-serif`;
    ctx.textAlign = align;
    ctx.lineWidth = 3.5;
    ctx.lineJoin = "round";
    ctx.strokeStyle = "rgba(6,11,22,.85)";
    ctx.strokeText(text, x, y);
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  };

  /** 판정과 결론의 비교판: 칸 둘(흑점이 적을 때, 많을 때), 위는 평소, 아래는 가렸을 때. */
  function drawBoard(ctx: CanvasRenderingContext2D, W: number, tMs: number): void {
    const cols: [number, number, string][] = [
      [W * 0.25, 0.1, "흑점이 적을 때"],
      [W * 0.75, 1, "흑점이 많을 때"],
    ];
    ctx.strokeStyle = "rgba(255,255,255,.12)";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.moveTo(W / 2, 30);
    ctx.lineTo(W / 2, H - 8);
    ctx.stroke();
    ctx.setLineDash([]);
    const rs = 33; // 위 원판
    const rm = 29; // 아래 달
    for (const [x, a, name] of cols) {
      label(ctx, name, x, 19, "center", "#FFE9B8", 13);
      drawSun(ctx, x, 66, rs, a, true);
      const yE = 168;
      drawCorona(ctx, x, yE, rm, a, 1);
      drawProms(ctx, x, yE, rm, a, 1, tMs, 1.6);
      drawChromo(ctx, x, yE, rm, 1);
      moonDisk(ctx, x, yE, rm * 1.012);
    }
    label(ctx, "평소", W / 2, 70, "center", "#A9BBDA", 12.5);
    label(ctx, "개기일식", W / 2, 172, "center", "#A9BBDA", 12.5);
  }

  canvas.addEventListener("pointerdown", (e) => {
    if (board || mode !== "surf" || coverT > 0.1) return;
    const p = localPt(canvas, e.clientX, e.clientY); // 넓은 화면의 확대를 되돌린 무대 px(그림과 같은 판)
    const x = p.x;
    const y = (p.y / (canvas.clientHeight || H)) * H;
    let best = -1;
    let bestD = 1e9;
    for (const i of shownAt(activity)) {
      if (!SPOTS[i][3]) continue;
      const [sx, sy] = spotXY(i, canvas.clientWidth / 2, CY, R);
      const d = Math.hypot(x - sx, y - sy);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    // 사진 속 흑점은 작아서(지름 3~6px) 누를 자리를 넉넉히 잡는다
    if (best >= 0 && bestD <= 30) {
      tapped = best;
      haptic(HAPTIC.select);
      if (!did.spot) {
        did.spot = true;
        if (phase === "play") f.say(`주위보다 온도가 낮아 어둡게 보이는 <b>흑점</b>이에요!${todo()}`);
        next();
      }
    } else if (!did.spot && phase === "play") {
      f.say("여기는 밝은 광구예요. 주위보다 어둡게 보이는 <b>검은 점(흑점)</b>을 찾아 눌러 보세요.");
    }
  });
  u7Dev(host, { act: (v: number) => { activity = v / 100; range.set(v); } });

  const loop: Loop = createLoop((dt, tMs) => {
    const fit = fitStageCanvas(canvas, H);
    const ctx = fit.ctx;
    const W = fit.w;
    const cx = W / 2;

    coverT = clamp(coverT + (mode === "ecl" ? 0.03 : -0.06) * dt, 0, 1);
    const covered = coverT > 0.96;
    const n = countAt(activity);
    pill.textContent = covered ? "광구가 가려져 대기가 보여요" : `흑점 ${n}개`;
    lamps.forEach((l, i) => l.classList.toggle("on", activity >= EARTH[i].at));

    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < 24; i++) {
      ctx.fillStyle = `rgba(220,232,255,${0.25 + ((i * 37) % 10) / 22})`;
      ctx.fillRect(((i * 97) % (W - 30)) + 15, ((i * 61) % (H - 30)) + 15, 1.6, 1.6);
    }

    if (board) {
      drawBoard(ctx, W, tMs);
      return;
    }

    // 평소의 태양(사진) → 코로나와 홍염, 채층(가려질수록 드러난다) → 달
    const atm = clamp((coverT - 0.6) / 0.4, 0, 1);
    drawSun(ctx, cx, CY, R, activity);
    drawCorona(ctx, cx, CY, R, activity, atm);
    const promAt = drawProms(ctx, cx, CY, R, activity, atm, tMs);
    drawChromo(ctx, cx, CY, R, clamp((coverT - 0.9) / 0.1, 0, 1));
    if (coverT > 0) moonDisk(ctx, cx + (1 - coverT) * (W * 0.5 + R), CY, R * 1.012);

    // 가렸을 때의 작은 창: 달 뒤에 가려진 광구와 지금의 흑점(원인이 결과와 한 화면에)
    if (atm > 0) {
      const bw = 92;
      const bx = W - bw - 8;
      const by = 8;
      ctx.save();
      ctx.globalAlpha = atm;
      ctx.fillStyle = "rgba(7,13,26,.92)";
      ctx.strokeStyle = "rgba(255,255,255,.34)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(bx, by, bw, bw, 14);
      ctx.fill();
      ctx.stroke();
      drawSun(ctx, bx + bw / 2, by + 39, 30, activity, true);
      label(ctx, "가려진 광구", bx + bw / 2, by + bw - 9, "center", "#DCE7FB", 12.5);
      ctx.restore();
    }

    // 이름표
    if (covered) {
      label(ctx, "코로나", cx - R - 22, CY - R * 0.72, "right");
      label(ctx, "채층", cx - R - 8, CY + R * 0.8, "right");
      if (promAt) label(ctx, "홍염", promAt[0] + 6, promAt[1] + 16, "left");
      label(ctx, "달", cx, CY + 5);
    } else if (coverT < 0.05) {
      if (tapped >= 0 && shownAt(activity).includes(tapped)) {
        const [sx, sy, rr] = spotXY(tapped, cx, CY, R);
        ctx.strokeStyle = "rgba(255,240,200,.95)";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(sx, sy, rr + 6, 0, Math.PI * 2);
        ctx.stroke();
        label(ctx, "흑점", sx, sy - rr - 12);
      }
      label(ctx, "태양의 밝은 표면(광구)", cx, CY + R + 22);
    }

    if (covered) {
      coronaMs += dt * 16.7;
      if (coronaMs > 600 && !did.corona) {
        did.corona = true;
        haptic(HAPTIC.ctaUnlock);
        if (phase === "play") f.say(`밝은 광구가 가려지자 대기인 <b>채층</b>과 <b>코로나</b>가 드러났어요!${todo()}`);
        next();
      }
    } else coronaMs = 0;
    if (covered && activity > 0.88) {
      activeMs += dt * 16.7;
      if (activeMs > 500 && !did.active) {
        did.active = true;
        haptic(HAPTIC.ctaUnlock);
        if (phase === "play") f.say(`흑점이 많아지자 <b>홍염</b>이 더 많이 솟아오르고 <b>코로나</b>가 크게 뻗어 나가요!${todo()}`);
        next();
      }
    } else activeMs = 0;
  });

  const raf = requestAnimationFrame(() => loop.start());
  return () => {
    disposed = true;
    cancelAnimationFrame(raf);
    loop.stop();
  };
};
