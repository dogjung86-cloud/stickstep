// [중2 Ⅴ v3] sunGaugeLab — 구현 예정 스텁(스켈레톤 단계). 레슨 저작 시 완전 구현으로 교체한다.
import { el } from "../../../core/dom";
import type { StepRenderer } from "../../types";

export const sunGaugeLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as { title: string; cta?: string };
  host.appendChild(el("div", { class: "h1", html: s.title }));
  host.appendChild(el("div", { class: "helper", text: "구현 준비 중인 랩이에요." }));
  api.setCTA(s.cta ?? "다음", { enabled: true });
  return () => {};
};
