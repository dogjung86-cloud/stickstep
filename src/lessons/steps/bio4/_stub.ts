// bio4 랩 공용 스켈레톤 — 구현 전 자리 지킴이(트리를 항상 컴파일 가능하게 유지, 플레이북 §6).
// 각 랩이 실제 구현으로 교체되면 해당 import가 사라지고, 전 랩 완성 후 이 파일을 삭제한다.
import { el } from "../../../core/dom";
import type { StepRenderer } from "../../types";

export function labStub(name: string): StepRenderer {
  return (host, step, api) => {
    const s = step as unknown as { title: string; lead?: string; cta?: string };
    host.appendChild(el("div", { class: "h1", html: s.title }));
    if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));
    host.appendChild(el("div", { class: "helper", html: `${name} — 제작 중인 랩이에요.` }));
    api.recordQuiz(true);
    api.setCTA(s.cta ?? "다음", { enabled: true });
  };
}
