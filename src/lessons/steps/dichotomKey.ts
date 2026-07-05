// dichotomKey — 5계 검색표(이분법). 생물을 주고 예/아니오 질문을 따라
// 어느 계에 속하는지 분류한다. 교과서 62쪽 검색표를 그대로 구현.

import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import type { StepAPI, StepRenderer } from "../types";

type Kingdom = "원핵생물계" | "원생생물계" | "균계" | "식물계" | "동물계";
interface Organism { name: string; kingdom: Kingdom; svg?: string; }
interface DichotomStep { title: string; lead?: string; organisms: Organism[]; explainGood?: string; explainBad?: string; }

type Node = "nucleus" | "other" | "photo" | "animal";
const QTEXT: Record<Node, string> = {
  nucleus: "핵막에 싸인 <b>뚜렷한 핵</b>이 있나요?",
  other: "균계·식물계·동물계 <b>어디에도 속하지 않나요?</b>",
  photo: "스스로 <b>광합성</b>을 하나요?",
  animal: "세포벽이 없고 <b>스스로 움직이나요?</b>",
};
const KINGDOM_COLOR: Record<Kingdom, string> = {
  원핵생물계: "#8A6BFF",
  원생생물계: "#12B886",
  균계: "#F0913E",
  식물계: "#12B886",
  동물계: "#3182F6",
};

function correctAnswer(k: Kingdom, node: Node): boolean {
  if (node === "nucleus") return k !== "원핵생물계";
  if (node === "other") return k === "원생생물계";
  if (node === "photo") return k === "식물계";
  return k === "동물계"; // animal
}
function advance(node: Node, yes: boolean): Node | Kingdom {
  if (node === "nucleus") return yes ? "other" : "원핵생물계";
  if (node === "other") return yes ? "원생생물계" : "photo";
  if (node === "photo") return yes ? "식물계" : "animal";
  return yes ? "동물계" : "균계";
}

export const dichotomKey: StepRenderer = (host, step, api) => {
  const s = step as unknown as DichotomStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  let oi = 0;
  let node: Node = "nucleus";
  let wrongTotal = 0;
  const path: string[] = [];

  const progress = el("div", { class: "dk-progress" });
  const card = el("div", { class: "dk-card" });
  const crumbs = el("div", { class: "dk-crumbs" });
  const qEl = el("div", { class: "dk-q" });
  const yesBtn = el("button", { class: "dk-btn yes", text: "예" });
  const noBtn = el("button", { class: "dk-btn no", text: "아니요" });
  const btns = el("div", { class: "dk-btns" }, yesBtn, noBtn);
  const hint = el("div", { class: "helper" });
  host.append(progress, card, crumbs, qEl, btns, hint);

  function renderOrganism(): void {
    node = "nucleus";
    path.length = 0;
    const org = s.organisms[oi];
    progress.innerHTML = `<b>${oi}</b> / ${s.organisms.length} 마리 분류 완료`;
    clear(card);
    card.classList.remove("classified");
    card.append(
      el("div", { class: "dk-face", html: org.svg ?? "" }),
      el("div", { class: "dk-name", text: org.name }),
    );
    clear(crumbs);
    renderQ();
    hint.innerHTML = "생물의 특징을 떠올리며 검색표를 따라가요.";
  }

  function renderQ(): void {
    qEl.innerHTML = QTEXT[node];
    btns.style.display = "";
  }

  function answer(yes: boolean, api2: StepAPI): void {
    const org = s.organisms[oi];
    if (yes !== correctAnswer(org.kingdom, node)) {
      wrongTotal += 1;
      haptic(HAPTIC.wrong);
      qEl.classList.add("shake");
      hint.innerHTML = "특징을 다시 생각해 볼까요? 이 생물의 성질과 맞지 않아요.";
      window.setTimeout(() => qEl.classList.remove("shake"), 420);
      return;
    }
    haptic(HAPTIC.select);
    crumbs.appendChild(el("span", { class: "dk-crumb", text: `${QTEXT[node].replace(/<[^>]+>/g, "")} · ${yes ? "예" : "아니요"}` }));
    const nxt = advance(node, yes);
    if (nxt === "원핵생물계" || nxt === "원생생물계" || nxt === "균계" || nxt === "식물계" || nxt === "동물계") {
      classify(nxt, api2);
    } else {
      node = nxt;
      renderQ();
    }
  }

  function classify(k: Kingdom, api2: StepAPI): void {
    haptic(HAPTIC.correct);
    btns.style.display = "none";
    qEl.innerHTML = "";
    card.classList.add("classified");
    card.appendChild(el("div", { class: "dk-badge", style: `--kc:${KINGDOM_COLOR[k]}`, text: k }));
    hint.innerHTML = `<b>${s.organisms[oi].name}</b> 은(는) <b style="color:${KINGDOM_COLOR[k]}">${k}</b>!`;
    oi += 1;
    if (oi >= s.organisms.length) {
      const good = wrongTotal === 0;
      api2.recordQuiz(good);
      window.setTimeout(() => {
        api2.openSheet({
          good,
          title: good ? "모두 분류했어요!" : "분류를 끝냈어요",
          html: (good ? s.explainGood : s.explainBad) ?? "",
          onContinue: api2.next,
        });
      }, 750);
    } else {
      window.setTimeout(renderOrganism, 850);
    }
  }

  yesBtn.addEventListener("click", () => answer(true, api));
  noBtn.addEventListener("click", () => answer(false, api));

  api.disableCTA();
  api.setCTA("검색표를 따라 분류하세요", { enabled: false });
  renderOrganism();
};
