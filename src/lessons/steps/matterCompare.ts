// matterCompare — 세 상태 나란히 보기(IV 단원 L2). 프로토타입 compare의 계승.
// 미니 메타볼 무대 3개(고체 -15℃ / 액체 25℃ / 기체 115℃)가 같은 물질의 세 얼굴을 동시에 보여준다.
// 관찰 스텝 — 게이트 없음.

import { el } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { createMatterStage, type MatterStage } from "../../ui/matterStage";
import type { StepRenderer } from "../types";

interface MatterCompareStep {
  title: string;
  lead?: string;
  note?: string; // 하단 노트(HTML)
  cta?: string;
}

const MINIS: { temp: number; name: string; color: string; desc: string }[] = [
  { temp: -15, name: "고체", color: "var(--c-solid)", desc: "제자리에서 진동만 해요" },
  { temp: 25, name: "액체", color: "var(--c-liquid)", desc: "미끄러지며 자리를 바꿔요" },
  { temp: 115, name: "기체", color: "var(--c-gas)", desc: "사방으로 날아다녀요" },
];

export const matterCompare: StepRenderer = (host, step, api) => {
  const s = step as unknown as MatterCompareStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const grid = el("div", { class: "mini-grid" });
  const stages: MatterStage[] = MINIS.map((m) => {
    const stage = createMatterStage({
      height: "112px",
      sim: { count: 12, r: 4.5, pad: 10, temp: m.temp, cols: m.temp < 0 ? 4 : 0 },
      toggle: false,
    });
    stage.el.classList.add("mini-stage");
    grid.appendChild(
      el(
        "div",
        { class: "mini" },
        stage.el,
        el("h4", {}, el("i", { style: `background:${m.color}` }), el("span", { text: m.name })),
        el("p", { text: m.desc }),
      ),
    );
    return stage;
  });
  host.appendChild(grid);
  host.appendChild(
    el("div", {
      class: "note",
      html:
        s.note ??
        "입자 사이의 거리도 <b>고체 → 액체 → 기체</b> 순서로 점점 멀어져요. 그래서 기체는 같은 양이라도 훨씬 넓은 공간을 차지하죠.",
    }),
  );

  const loop: Loop = createLoop((dt, tMs) => {
    for (const st of stages) st.tick(dt, tMs);
  });
  const onResize = (): void => stages.forEach((st) => st.resize());
  window.addEventListener("resize", onResize);
  const rafId = requestAnimationFrame(() => {
    for (const st of stages) {
      st.resize();
      st.sim.buildLattice(true);
    }
    loop.start();
  });

  api.setCTA(s.cta ?? "다음", { enabled: true, onClick: () => api.next() });
  return () => {
    cancelAnimationFrame(rafId);
    loop.stop();
    window.removeEventListener("resize", onResize);
    stages.forEach((st) => st.dispose());
  };
};
