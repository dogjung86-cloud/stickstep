// curio — "교과서엔 없지만 한 번쯤 궁금한 질문" 카드.
// 질문 헤드를 탭하면 답이 펼쳐진다. 랩 스텝이 content의 curio: { q, a } 데이터를 받아 붙인다.
// 기준 구현: u7l3 sunLab("흑점은 온도가 낮은데 왜 많아지면 활발할까?").

import { el } from "../core/dom";
import { haptic, HAPTIC } from "../core/haptics";
import { icon } from "../core/icons";

export interface Curio {
  q: string; // 질문(HTML 허용)
  a: string; // 답(HTML 허용)
}

export function curioCard(c: Curio): HTMLElement {
  const card = el("div", { class: "curio" });
  const head = el(
    "button",
    { class: "curio-head", attrs: { type: "button", "aria-expanded": "false" } },
    el("span", { class: "curio-ic", html: icon("bulb", 16, { sw: 2 }) }),
    el("span", { class: "curio-txt", html: c.q }),
    el("span", { class: "curio-chev", html: icon("chevronDown", 16, { sw: 2.2 }) }),
  );
  const body = el("div", { class: "curio-body", html: c.a });
  card.append(head, body);
  head.addEventListener("click", () => {
    const open = card.classList.toggle("open");
    head.setAttribute("aria-expanded", String(open));
    haptic(HAPTIC.select);
  });
  return card;
}
