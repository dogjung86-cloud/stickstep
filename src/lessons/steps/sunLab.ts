// sunLab — 태양의 활동 랩(VII 단원 L3). 교과서 236~239쪽의 조작판.
//   · 광구 모드: 쌀알 무늬 위 흑점을 탭해서 정체 확인(주위보다 온도가 낮다).
//   · 개기일식 모드: 달이 광구를 가리면 평소 안 보이던 대기(채층·코로나)와
//     홍염이 드러난다 — 코로나는 태양 활동이 활발할수록 커진다.
//   · 활동 슬라이더(약 11년 주기): 흑점 수·홍염·코로나·지구 영향(오로라 등)이 함께 변한다.
// 목표: ① 흑점 탭 ② 개기일식으로 코로나 보기 ③ 활발한 시기의 지구 영향 확인.

import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface SunLabStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

interface Spot {
  a: number; // 각도
  d: number; // 중심 거리(반지름 비율)
  r: number; // 크기
}

const SPOTS: Spot[] = [
  { a: 0.4, d: 0.35, r: 9 }, { a: 2.2, d: 0.55, r: 7 }, { a: 4.1, d: 0.42, r: 11 },
  { a: 1.3, d: 0.68, r: 6 }, { a: 5.2, d: 0.5, r: 8 }, { a: 3.2, d: 0.3, r: 6.5 },
  { a: 0.9, d: 0.75, r: 5 }, { a: 5.9, d: 0.62, r: 7.5 }, { a: 2.8, d: 0.7, r: 5.5 },
  { a: 3.8, d: 0.58, r: 6 }, { a: 1.8, d: 0.4, r: 5 }, { a: 4.7, d: 0.72, r: 5 },
];

export const sunLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as SunLabStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const canvas = el("canvas", { class: "mstage-cvblock", style: "height:300px" }) as HTMLCanvasElement;
  const spotPill = el("span", { text: "흑점 5개" });
  const seg = el("div", { class: "seg stage-seg" });
  const surfBtn = el("button", { class: "on", text: "광구", attrs: { type: "button", "aria-pressed": "true" } });
  const eclBtn = el("button", { text: "개기일식", attrs: { type: "button", "aria-pressed": "false" } });
  seg.append(surfBtn, eclBtn);
  const stage = el(
    "div",
    { class: "stage" },
    canvas,
    el("div", { class: "stage-hud" }, el("div", { class: "pill" }, el("span", { class: "pdot", style: "background:#FFB03A" }), spotPill), seg),
  );

  // 활동 슬라이더
  const fill = el("i", { class: "sl-fill" });
  const thumb = el("b", { class: "sl-thumb" });
  const track = el("div", { class: "sl-track" }, fill, thumb);
  const slider = el(
    "div",
    { class: "hp-slider sunlab-sl" },
    el("span", { class: "sl-lab", text: "조용한 시기" }),
    track,
    el("span", { class: "sl-lab", text: "활발한 시기" }),
  );

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge", dataset: { g: "spot" } }, el("b", { text: "흑점" }), el("span", { text: "탭해 보기" })),
    el("div", { class: "pn-badge", dataset: { g: "corona" } }, el("b", { text: "코로나" }), el("span", { text: "일식으로" })),
    el("div", { class: "pn-badge", dataset: { g: "storm" } }, el("b", { text: "지구 영향" }), el("span", { text: "활발할 때?" })),
  );

  // ── 지구 영향 그래프: 흑점 수 ↑ → 오로라·통신 장애·정전 발생 ↑ ──
  const GX0 = 36;
  const GX1 = 264;
  const GY0 = 92;
  const CURVES: { key: string; label: string; color: string; pow: number; amp: number }[] = [
    { key: "aurora", label: "오로라", color: "#2AC98F", pow: 1.5, amp: 66 },
    { key: "comms", label: "무선 통신 장애", color: "#5AA2F8", pow: 1.9, amp: 52 },
    { key: "power", label: "대규모 정전", color: "#F0A422", pow: 2.4, amp: 38 },
  ];
  const curveY = (c: (typeof CURVES)[number], a: number): number => GY0 - Math.pow(a, c.pow) * c.amp;
  const curvePath = (c: (typeof CURVES)[number]): string => {
    let d = `M${GX0} ${GY0}`;
    for (let i = 1; i <= 24; i++) {
      const a = i / 24;
      d += ` L${(GX0 + a * (GX1 - GX0)).toFixed(1)} ${curveY(c, a).toFixed(1)}`;
    }
    return d;
  };
  const graph = el("div", { class: "sunlab-graph" });
  graph.innerHTML = `<div class="sunlab-graph-title">흑점 수가 늘면, 지구에서는?</div>
  <svg viewBox="0 0 280 112" xmlns="http://www.w3.org/2000/svg" fill="none" aria-hidden="true">
    <path d="M${GX0} ${GY0}H${GX1}M${GX0} ${GY0}V12" stroke="#C6CFDC" stroke-width="1.4" stroke-linecap="round"/>
    <text x="${GX1}" y="${GY0 + 14}" fill="#6B7684" font-size="9" text-anchor="end" font-family="Pretendard, sans-serif">흑점 수(태양 활동) →</text>
    <text x="${GX0 - 4}" y="12" fill="#6B7684" font-size="9" text-anchor="start" font-family="Pretendard, sans-serif">발생 횟수</text>
    ${CURVES.map((c) => `<path d="${curvePath(c)}" stroke="${c.color}" stroke-width="2.4" stroke-linecap="round"/>`).join("")}
    <g class="slg-marker">
      <path d="M0 ${GY0}V16" stroke="#8A94A6" stroke-width="1.2" stroke-dasharray="3 3"/>
      ${CURVES.map((c) => `<circle class="slg-dot-${c.key}" cx="0" cy="${GY0}" r="3.4" fill="${c.color}" stroke="#fff" stroke-width="1.4"/>`).join("")}
    </g>
  </svg>
  <div class="sunlab-legend">${CURVES.map((c) => `<span><i style="background:${c.color}"></i>${c.label}</span>`).join("")}</div>`;
  const marker = graph.querySelector(".slg-marker") as SVGGElement;
  const dots = CURVES.map((c) => graph.querySelector(`.slg-dot-${c.key}`) as SVGCircleElement);

  const helper = el("div", {
    class: "helper",
    html: "태양의 표면(<b>광구</b>)이에요. 쌀알을 뿌린 듯한 무늬 사이 <b>어두운 점</b>이 보이죠? 눌러 보세요!",
  });
  host.append(goalChips, stage, slider, graph, helper);
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ---- 상태 ----
  let mode: "surf" | "ecl" = "surf";
  let activity = 0.35; // 0..1
  let coverT = 0; // 달 덮임 0..1
  let coronaMs = 0;
  let stormMs = 0;
  let tappedSpot = -1;
  let tapMsg = 0;
  const goals = new Set<string>();
  let finished = false;

  function collect(id: string, subText: string): void {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalChips.querySelector(`[data-g="${id}"]`) as HTMLElement;
    chip.classList.add("on");
    chip.querySelector("span")!.textContent = subText;
    haptic(HAPTIC.ctaUnlock);
    const hints: Record<string, string> = {
      spot: "그게 <b>흑점</b>! 주위보다 <b>온도가 낮아서</b> 어둡게 보여요. 흑점 수는 약 <b>11년 주기</b>로 변해요. 이제 <b>개기일식</b> 버튼을 눌러 봐요.",
      corona: "광구가 가려지니 <b>붉고 얇은 채층</b>과 <b>진주색 코로나</b>가 드러났어요! 가장자리의 불꽃(<b>홍염</b>)도 보이죠? 이제 슬라이더를 <b>활발한 시기</b>로!",
      storm: "아래 그래프를 봐요 — 흑점 수가 늘자 <b>오로라·무선 통신 장애·정전</b>이 나란히 치솟았죠? 활발한 시기엔 <b>태양풍</b>이 강해져 지구까지 영향을 줘요.",
    };
    if (!finished) helper.innerHTML = hints[id] ?? "";
    if (goals.size === 3 && !finished) {
      finished = true;
      helper.innerHTML =
        "정리! 표면(광구)엔 <b>쌀알 무늬·흑점</b>, 대기(채층·코로나)에선 <b>홍염·플레어</b>. 활동이 활발하면 <b>흑점 수↑ · 코로나 커짐 · 태양풍 강해짐</b> — 그 영향이 지구까지 닿아요. 아래 <b>궁금해요 카드</b>도 눌러 보세요!";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
    }
  }

  // 쌀알 무늬 오프스크린(한 번 생성)
  const gran = document.createElement("canvas");
  gran.width = 512;
  gran.height = 512;
  {
    const g = gran.getContext("2d")!;
    const grd = g.createRadialGradient(256, 256, 40, 256, 256, 256);
    grd.addColorStop(0, "#FFD25E");
    grd.addColorStop(0.65, "#FFAE35");
    grd.addColorStop(1, "#F08A1E");
    g.fillStyle = grd;
    g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 5200; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const r = 2 + Math.random() * 4;
      g.fillStyle = Math.random() > 0.5 ? "rgba(255,236,180,.32)" : "rgba(214,110,20,.26)";
      g.beginPath();
      g.ellipse(x, y, r, r * 0.8, Math.random() * 3, 0, Math.PI * 2);
      g.fill();
    }
  }

  const spotCount = (): number => Math.round(3 + activity * 9);

  // ---- 모드 전환 ----
  function setMode(m: "surf" | "ecl"): void {
    if (mode === m) return;
    mode = m;
    surfBtn.classList.toggle("on", m === "surf");
    eclBtn.classList.toggle("on", m === "ecl");
    surfBtn.setAttribute("aria-pressed", String(m === "surf"));
    eclBtn.setAttribute("aria-pressed", String(m === "ecl"));
    haptic(HAPTIC.select);
    if (m === "ecl" && !goals.has("corona")) helper.innerHTML = "달이 태양 앞으로… 완전히 가려지는 순간을 기다려 보세요!";
  }
  surfBtn.addEventListener("click", () => setMode("surf"));
  eclBtn.addEventListener("click", () => setMode("ecl"));

  // ---- 슬라이더 ----
  let dragSl = false;
  const setAct = (clientX: number): void => {
    const r = track.getBoundingClientRect();
    activity = clamp((clientX - r.left) / r.width, 0, 1);
  };
  track.addEventListener("pointerdown", (e) => {
    dragSl = true;
    setAct(e.clientX);
    try {
      track.setPointerCapture(e.pointerId);
    } catch {
      /* 합성 이벤트 */
    }
  });
  track.addEventListener("pointermove", (e) => {
    if (dragSl) setAct(e.clientX);
  });
  const slUp = (): void => {
    dragSl = false;
  };
  track.addEventListener("pointerup", slUp);
  track.addEventListener("pointercancel", slUp);

  // ---- 흑점 탭 ----
  canvas.addEventListener("pointerdown", (e) => {
    if (mode !== "surf") return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const W = rect.width;
    const cx = W / 2;
    const cy = 150;
    const R = Math.min(W * 0.34, 112);
    const n = spotCount();
    for (let i = 0; i < n && i < SPOTS.length; i++) {
      const sp = SPOTS[i];
      const sx = cx + Math.cos(sp.a) * sp.d * R;
      const sy = cy + Math.sin(sp.a) * sp.d * R * 0.92;
      if (Math.hypot(x - sx, y - sy) < Math.max(16, sp.r + 8)) {
        tappedSpot = i;
        tapMsg = 1600;
        haptic(HAPTIC.select);
        collect("spot", "온도가 낮다!");
        return;
      }
    }
  });

  // ---- 프레임 ----
  const loop: Loop = createLoop((dt, tMs) => {
    const fit = fitCanvas(canvas, 300);
    const ctx = fit.ctx;
    const W = fit.w;
    const H = fit.h;
    const cx = W / 2;
    const cy = 150;
    const R = Math.min(W * 0.34, 112);

    // 덮임 애니메이션
    coverT = clamp(coverT + (mode === "ecl" ? 0.028 : -0.05) * dt, 0, 1);
    const covered = coverT > 0.96;

    // UI 반영
    fill.style.width = `${activity * 100}%`;
    thumb.style.left = `${activity * 100}%`;
    spotPill.textContent = mode === "ecl" && covered ? "코로나가 보여요" : `흑점 ${spotCount()}개`;

    // 배경
    ctx.fillStyle = "rgba(8,14,26,.5)";
    ctx.fillRect(6, 6, W - 12, H - 12);
    // 별
    for (let i = 0; i < 26; i++) {
      const sx = ((i * 97) % (W - 40)) + 20;
      const sy = ((i * 61) % (H - 40)) + 20;
      ctx.fillStyle = `rgba(220,232,255,${0.25 + ((i * 37) % 10) / 22})`;
      ctx.fillRect(sx, sy, 1.6, 1.6);
    }

    // 코로나(일식 때 + 활동 비례) — 사진처럼 원반을 감싸는 진주색 왕관, 무대는 어둡게 유지
    if (coverT > 0.5) {
      const cr = R * (0.26 + activity * 0.34) * (coverT - 0.5) * 2;
      const cg = ctx.createRadialGradient(cx, cy, R * 0.95, cx, cy, R + cr);
      cg.addColorStop(0, `rgba(226,238,255,${0.34 * coverT})`);
      cg.addColorStop(0.5, `rgba(196,214,246,${0.12 * coverT})`);
      cg.addColorStop(1, "rgba(196,214,246,0)");
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(cx, cy, R + cr, 0, Math.PI * 2);
      ctx.fill();
      // 코로나 줄기(원반에 붙는 짧은 결)
      ctx.strokeStyle = `rgba(214,230,255,${0.15 * coverT})`;
      ctx.lineWidth = 1.3;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + 0.3;
        const len = cr * (0.5 + (i % 3) * 0.16);
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * R * 1.03, cy + Math.sin(a) * R * 1.03);
        ctx.lineTo(cx + Math.cos(a) * (R * 1.03 + len), cy + Math.sin(a) * (R * 1.03 + len));
        ctx.stroke();
      }
    }

    // 광구(쌀알 무늬) — 천천히 자전
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.clip();
    ctx.translate(cx, cy);
    ctx.rotate(tMs * 0.000018);
    ctx.drawImage(gran, -R * 1.45, -R * 1.45, R * 2.9, R * 2.9);
    ctx.rotate(-tMs * 0.000018);
    // 흑점
    const n = spotCount();
    for (let i = 0; i < n && i < SPOTS.length; i++) {
      const sp = SPOTS[i];
      const sx = Math.cos(sp.a) * sp.d * R;
      const sy = Math.sin(sp.a) * sp.d * R * 0.92;
      const rr = sp.r * (R / 112);
      const pg = ctx.createRadialGradient(sx, sy, rr * 0.2, sx, sy, rr * 1.9);
      pg.addColorStop(0, "rgba(52,26,8,.95)");
      pg.addColorStop(0.55, "rgba(112,52,14,.75)");
      pg.addColorStop(1, "rgba(150,80,20,0)");
      ctx.fillStyle = pg;
      ctx.beginPath();
      ctx.arc(sx, sy, rr * 1.9, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 홍염(가장자리 불꽃 아치) — 활동 비례, 일식 때 특히 잘 보임
    const promN = Math.round(1 + activity * 4);
    const promA = coverT > 0.5 ? 0.85 : 0.3;
    for (let i = 0; i < promN; i++) {
      const a = (i / promN) * Math.PI * 2 + 0.9 + Math.sin(tMs * 0.0004 + i) * 0.05;
      const px = cx + Math.cos(a) * R;
      const py = cy + Math.sin(a) * R;
      const h2 = (10 + (i % 3) * 7 + activity * 10) * (R / 112);
      ctx.strokeStyle = `rgba(255,96,60,${promA})`;
      ctx.lineWidth = 3.4;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(px + Math.cos(a + 1.57) * h2 * 0.5, py + Math.sin(a + 1.57) * h2 * 0.5, h2 * 0.62, a + Math.PI * 0.9, a + Math.PI * 2.1);
      ctx.stroke();
    }

    // 달 원반(일식)
    if (coverT > 0) {
      const mx = cx + (1 - coverT) * (W * 0.5 + R);
      ctx.fillStyle = "#070B14";
      ctx.beginPath();
      ctx.arc(mx, cy, R * 1.01, 0, Math.PI * 2);
      ctx.fill();
      // 채층(완전히 덮이기 직전 가장자리 붉은 링)
      if (coverT > 0.9) {
        ctx.strokeStyle = `rgba(255,84,54,${(coverT - 0.9) * 9})`;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.arc(mx, cy, R * 1.015, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // 흑점 라벨
    if (tapMsg > 0 && mode === "surf") {
      tapMsg -= dt * 16.7;
      const sp = SPOTS[tappedSpot];
      if (sp) {
        const sx = cx + Math.cos(sp.a) * sp.d * R;
        const sy = cy + Math.sin(sp.a) * sp.d * R * 0.92;
        ctx.strokeStyle = "rgba(255,224,168,.9)";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(sx, sy, sp.r + 7, 0, Math.PI * 2);
        ctx.stroke();
        ctx.font = "700 11px Pretendard, sans-serif";
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(255,236,200,.95)";
        ctx.fillText("흑점 — 주위보다 온도가 낮아요", cx, cy + R + 26);
      }
    }

    // 지구 영향 그래프 마커 — 흑점 수(활동)에 따라 세 곡선 위를 함께 이동
    const gx = GX0 + activity * (GX1 - GX0);
    marker.setAttribute("transform", `translate(${gx.toFixed(1)} 0)`);
    CURVES.forEach((c, i) => dots[i].setAttribute("cy", curveY(c, activity).toFixed(1)));

    // 코로나 목표(일식 + 완전 덮임 유지)
    if (mode === "ecl" && covered) {
      coronaMs += dt * 16.7;
      if (coronaMs > 600) collect("corona", "대기가 보여요!");
    } else coronaMs = 0;
    // 영향 목표(활발 유지)
    if (activity > 0.86) {
      stormMs += dt * 16.7;
      if (stormMs > 600) collect("storm", "태양풍 강해짐");
    } else stormMs = 0;
  });

  api.setCTA("흑점 → 일식 → 활발한 시기!", { enabled: false });
  const rafId = requestAnimationFrame(() => loop.start());
  return () => {
    cancelAnimationFrame(rafId);
    loop.stop();
  };
};
