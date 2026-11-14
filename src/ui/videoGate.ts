// 영상 걸음 시트(.vgs-): 영상을 지나가지 않은 채 묶음의 첫 레슨을 누르면 뜬다(2026-11-15 사용자 확정 "보거나 건너뛰면").
// "영상 보기"는 누른 손길 안에서 곧바로 재생 화면을 연다(아이폰 사파리는 누른 직후가 아니면 소리 있는 재생을 막는다).
// "건너뛰고 레슨 시작"은 영상 걸음을 지나간 것으로 적고 레슨을 연다. 바깥(어두운 막)이나 닫기, Esc는 아무것도 하지 않고 닫는다.
import { el } from "../core/dom";
import { icon } from "../core/icons";
import { haptic, HAPTIC } from "../core/haptics";
import { videoProgressOf } from "../core/store";
import { videoMinutes, type VideoEpisode } from "../content/videos";

export function openVideoGateSheet(host: HTMLElement, ep: VideoEpisode, o: { onWatch: () => void; onSkip: () => void }): void {
  host.querySelectorAll(".vgs, .vgs-scrim").forEach((n) => n.remove());
  const part = (videoProgressOf(ep.id)?.sec ?? 0) >= 5;
  const scrim = el("div", { class: "scrim vgs-scrim" });
  const x = el("button", { class: "vgs-x", attrs: { "aria-label": "닫기" }, html: icon("x", 15) });
  const watch = el("button", { class: "btn vgs-watch" }, el("span", { class: "vgs-wic", html: icon("play", 16) }), el("span", { text: part ? "이어 보기" : "영상 보기" }));
  const skip = el("button", { class: "vgs-skip", text: "건너뛰고 레슨 시작" });
  const sheet = el(
    "div",
    { class: "sheet vgs", attrs: { role: "dialog", "aria-modal": "true", "aria-label": "개념 영상 먼저 보기" } },
    el(
      "div",
      { class: "vgs-card" },
      el("div", { class: "vgs-grip", attrs: { "aria-hidden": "true" } }),
      x,
      el(
        "div",
        { class: "vgs-head" },
        el("span", { class: "vgs-ic", attrs: { "aria-hidden": "true" }, html: icon("play", 18) }),
        el("div", { class: "vgs-tt" }, el("em", { text: `개념 영상 · ${videoMinutes(ep)}` }), el("b", { text: ep.title })),
      ),
      el("p", { class: "vgs-p", text: "영상을 보면 이 레슨이 열려요. 건너뛰고 바로 시작해도 돼요." }),
      watch,
      skip,
    ),
  );
  host.append(scrim, sheet);

  let closed = false;
  const onKey = (e: KeyboardEvent): void => {
    if (e.key === "Escape") close();
  };
  function close(then?: () => void): void {
    if (closed) return;
    closed = true;
    sheet.classList.remove("open");
    scrim.classList.remove("open");
    document.removeEventListener("keydown", onKey);
    window.setTimeout(() => {
      sheet.remove();
      scrim.remove();
    }, 280);
    then?.(); // 손길 안에서 바로(재생 화면이 누른 직후에 play()를 부를 수 있게)
  }
  document.addEventListener("keydown", onKey);
  scrim.addEventListener("click", () => close());
  x.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    close();
  });
  watch.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    close(o.onWatch);
  });
  skip.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    close(o.onSkip);
  });
  void sheet.offsetWidth; // 닫힌 자리에서 한 번 그린 뒤 열어야 올라오는 움직임이 보인다
  scrim.classList.add("open");
  sheet.classList.add("open");
  watch.focus({ preventScroll: true });
}
